const _ = require('lodash');
const Big = require('big.js');
const currencyFormatter = require('currency-formatter');
const { isEuCountry } = require('./country');
const { bigMin } = require('./big-utils');
const { calculateGrossValue, calculateTaxValue, getTaxPercentage } = require('./tax');
const { valueToRegularUnits, isZeroDecimalCurrency } = require('./stripe');
const { products } = require('./products');

function taxesObjToArr(taxByP) {
  const arr = _.map(taxByP, (value, p) => {
    return { taxPercentage: Number(p), value };
  });

  return _.sortBy(arr, 'taxPercentage');
}

function calculateItemBreakdown(item, currency, taxPercentage) {
  let itemOriginalNetPrice;
  if (item.product.dynamicPrice) {
    itemOriginalNetPrice = new Big(item.metadata.value).times(item.quantity);
  } else if (!_.has(item.product.netPrices, currency)) {
    throw new Error(`Item ${item.id} does not have price in ${currency} currency.`);
  } else {
    itemOriginalNetPrice = item.product.netPrices[currency].times(item.quantity);
  }

  const unitNetDiscount = _.get(item.netDiscounts, currency, new Big(0));
  const itemNetDiscount = unitNetDiscount.times(item.quantity);
  const itemGrossDiscount = calculateGrossValue(itemNetDiscount, taxPercentage);
  const itemNetPrice = itemOriginalNetPrice.minus(itemNetDiscount);
  const itemTaxValue = calculateTaxValue(itemNetPrice, taxPercentage);
  const itemGrossPrice = calculateGrossValue(itemNetPrice, taxPercentage);

  return {
    // discount has been subtracted from net, gross and tax values
    netValue: itemNetPrice,
    grossValue: itemGrossPrice,
    taxValue: itemTaxValue,
    grossDiscount: itemGrossDiscount,
  };
}

function calculateCartTotals(cart, currency, taxPercentage) {
  const totals = _.reduce(cart, (memo, item) => {
    const itemValues = calculateItemBreakdown(item, currency, taxPercentage);
    console.log(JSON.stringify(itemValues, null ,2))
    const newTaxVal = _.isUndefined(memo.taxByP[taxPercentage])
      ? itemValues.taxValue
      : memo.taxByP[taxPercentage].plus(itemValues.taxValue);

    return {
      netTotal: memo.netTotal.plus(itemValues.netValue),
      grossTotal: memo.grossTotal.plus(itemValues.grossValue),
      grossDiscountTotal: memo.grossDiscountTotal.plus(itemValues.grossDiscount),
      taxByP: _.extend({}, memo.taxByP, {
        [taxPercentage]: newTaxVal,
      }),
    };
  }, {
    netTotal: new Big(0),
    grossTotal: new Big(0),
    grossDiscountTotal: new Big(0),
    taxByP: {},
  });

  return totals;
}

function mergeCartItemsToProducts(cart) {
  const cartProducts = _.map(cart, (item) => {
    const product = _.find(products, p => p.id === item.id);
    if (!product) {
      throw new Error(`No such product with id: ${item.id}`);
    }

    return _.extend({}, item, { product });
  });
  return cartProducts;
}

// TODO: rules
function addNetDiscounts(product, promotion) {
  if (!promotion) {
    return product;
  }

  const promotionDiscountClass = _.startsWith(promotion.promotionCode, 'PLATINUM')
    ? 1
    : 0;

  // If the promotion code does not cover the product, don't add discount
  if (product.discountClass <= promotionDiscountClass) {
    return product;
  }

  const netDiscounts = {};
  _.forEach(product.netPrices, (netValue, currency) => {
    const netPrice = { value: netValue, currency };
    netDiscounts[currency] = promotionToNetDiscount(netPrice, promotion);
  });

  return _.extend({}, product, { netDiscounts });
}

function addCartDiscountsAndProductInfo(cart, opts = {}) {
  const cartProducts = mergeCartItemsToProducts(cart);
  const { promotion } = opts;
  if (!promotion) {
    return cartProducts;
  }

  if (!opts.ignorePromotionExpiry && _.get(promotion, 'hasExpired')) {
    throw new Error(`Promotion (${promotion.promotionCode}) has expired`);
  }

  const discountedCartProducts = _.map(cartProducts, p => addNetDiscounts(p, promotion));
  return discountedCartProducts;
}

function promotionToNetDiscount(netPrice, promotion) {
  switch (promotion.type) {
    case 'FIXED':
      if (netPrice.currency !== promotion.currency) {
        throw new Error(`Promotion currency mismatches the total value: ${netPrice.currency} !== ${promotion.currency}`);
      }

      const promotionValue = new Big(promotion.value).round(0);

      // Make sure the discount can't be more than the total value.
      return {
        value: bigMin(promotionValue, netPrice.value),
        currency: netPrice.currency,
      };
    case 'PERCENTAGE':
      // promotion.value is a factor, e.g. 0.2 (-20%) to describe the percentage
      // discount
      const discountValue = netPrice.value.times(new Big(promotion.value));

      // Make sure the discount can't be more than the total value.
      return {
        value: bigMin(discountValue, netPrice.value),
        currency: netPrice.currency,
      };
    default:
      throw new Error(`Invalid promotion type: ${promotion.type}`);
  }
}

function createPriceObject(basePriceObj, currency) {
  const fullPriceObj = _.merge({}, basePriceObj, {
    value: Number(basePriceObj.value.toFixed(0)),
    label: formatPrice(basePriceObj.value, currency),
    humanValue: valueToRegularUnits(basePriceObj.value, currency).toFixed(2),
  });

  return fullPriceObj;
}

function formatPrice(value, currency) {
  const regularValue = valueToRegularUnits(value, currency);
  return currencyFormatter.format(regularValue.toFixed(2), { code: currency });
}

function calculateCartPrice(cart, _opts = {}) {
  const opts = _.merge({
    shipToCountry: 'FI',
    currency: 'EUR',
  }, _opts);

  const discountedCart = addCartDiscountsAndProductInfo(cart, opts);
  const taxPercentage = getTaxPercentage(opts);
  console.log(JSON.stringify(discountedCart, null ,2));
  const cartTotals = calculateCartTotals(discountedCart, opts.currency, taxPercentage);
  console.log(JSON.stringify(cartTotals, null ,2));
  const grossPriceObj = createPriceObject({
    value: cartTotals.grossTotal,
    currency: opts.currency,
    zeroDecimalCurrency: isZeroDecimalCurrency(opts.currency),
  }, opts.currency);

  return _.merge({}, grossPriceObj, {
    net: createPriceObject({ value: cartTotals.netTotal }, opts.currency),
    taxes: _.map(taxesObjToArr(cartTotals.taxByP), (tax) => {
      const priceObj = createPriceObject({ value: tax.value }, opts.currency);
      return _.extend({}, priceObj, { taxPercentage: tax.taxPercentage });
    }),
  });
}

function calculateItemPrice(item, opts = {}) {
  if (opts.onlyUnitPrice) {
    const unitItem = _.extend({}, item, { quantity: 1 });
    return calculateCartPrice([unitItem], opts);
  }

  if (!_.isInteger(item.quantity)) {
    throw new Error(`Item quantity should be an integer. Item: ${item}`);
  }
  if (item.quantity < 1) {
    throw new Error(`Item quantity should at least 1. Item: ${item}`);
  }

  return calculateCartPrice([item], opts);
}

module.exports = {
  calculateCartPrice,
  calculateItemPrice,
  isEuCountry,
};

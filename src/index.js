const _ = require('lodash');
const Big = require('big.js');
const currencyFormatter = require('currency-formatter');
const { isEuCountry } = require('./country');
const {
  calculateGrossValue,
  calculateTaxValue,
  calculateNetValue,
  getTaxPercentage,
} = require('./tax');
const { addDiscountsForItems } = require('./discount');
const { validateCart } = require('./validation');
const { valueToRegularUnits, isZeroDecimalCurrency } = require('./stripe');
const { products, supportedCurrencies } = require('./products');

function taxesObjToArr(taxByP) {
  const arr = _.map(taxByP, (value, p) => ({ taxPercentage: new Big(p), value }));

  return _.sortBy(arr, 'taxPercentage');
}

function calculateItemBreakdown(item, currency, taxPercentage) {
  if (!_.get(item, ['product', 'grossPrices', currency])) {
    throw new Error(`Item ${item.id} does not have price in ${currency} currency`);
  }

  const itemOriginalGrossPrice = item.product.grossPrices[currency].times(item.quantity);
  const itemGrossDiscount = _.get(item.grossDiscounts, currency, new Big('0'));
  const itemGrossPrice = itemOriginalGrossPrice.minus(itemGrossDiscount);
  const itemNetPrice = calculateNetValue(itemGrossPrice, taxPercentage);
  const itemTaxValue = calculateTaxValue(itemNetPrice, taxPercentage);

  return {
    // discount has been subtracted from net, gross and tax values
    netValue: itemNetPrice,
    grossValue: itemGrossPrice,
    taxValue: itemTaxValue,
    grossDiscount: itemGrossDiscount,
  };
}

function calculateExactCartTotals(cart, opts) {
  const totals = _.reduce(cart, (memo, item) => {
    const taxPercentage = getTaxPercentage(item.product, opts);
    const itemValues = calculateItemBreakdown(item, opts.currency, taxPercentage);
    const newTaxVal = _.isUndefined(memo.taxByP[taxPercentage])
      ? itemValues.taxValue
      : memo.taxByP[taxPercentage].plus(itemValues.taxValue);

    return {
      // Net total is not returned as it is calculated from rounded values later
      grossTotal: memo.grossTotal.plus(itemValues.grossValue),
      grossDiscountTotal: memo.grossDiscountTotal.plus(itemValues.grossDiscount),
      taxByP: _.extend({}, memo.taxByP, {
        [taxPercentage]: newTaxVal,
      }),
    };
  }, {
    grossTotal: new Big('0'),
    grossDiscountTotal: new Big('0'),
    taxByP: {},
  });

  return totals;
}

function enrichAndValidateCartItems(cart, opts) {
  const cartProducts = _.map(cart, (item) => {
    const product = _.find(products, p => p.id === item.id);
    if (!product) {
      throw new Error(`No such product with id: ${item.id}`);
    }

    return _.extend({}, item, { product });
  });

  validateCart(cartProducts);

  return _.map(cartProducts, (item) => {
    const { product } = item;
    if (!product.dynamicPrice) {
      return item;
    }

    const netPrice = new Big(item.customisation.netValue);
    const newProduct = _.extend({}, product, {
      netPrices: {
        [opts.currency]: netPrice,
      },
      grossPrices: {
        [opts.currency]: calculateGrossValue(netPrice, product.vatPercentage),
      },
    });

    return _.extend({}, item, { product: newProduct });
  });
}

function getSupportedCurrencies(/* shipToCountry */) {
  return supportedCurrencies;
}

function isSupportedCurrency(currency, shipToCountry) {
  return _.includes(getSupportedCurrencies(shipToCountry), currency.toUpperCase());
}

function createPriceObject(basePriceObj, currency) {
  const fullPriceObj = _.merge({}, basePriceObj, {
    value: Number(basePriceObj.value.toFixed(0)),
    label: formatPrice(basePriceObj.value, currency),
    humanValue: valueToRegularUnits(basePriceObj.value, currency),
  });

  return fullPriceObj;
}

function formatPrice(value, currency) {
  const regularValue = valueToRegularUnits(value, currency);
  return currencyFormatter.format(regularValue, { code: currency });
}

function calculateCartPrice(cart, _opts = {}) {
  const opts = _.merge({
    shipToCountry: 'FI',
    currency: 'EUR',
  }, _opts);

  const cartItems = enrichAndValidateCartItems(cart, opts);
  const discountedCart = addDiscountsForItems(cartItems, opts);
  const cartTotals = calculateExactCartTotals(discountedCart, opts);

  const taxesArr = _.map(taxesObjToArr(cartTotals.taxByP), (tax) => {
    const roundedTaxValue = tax.value.round(0);
    const priceObj = createPriceObject({ value: roundedTaxValue }, opts.currency);
    return _.extend({}, priceObj, { taxPercentage: Number(tax.taxPercentage.toFixed(0)) });
  });
  const roundedGrossTotal = cartTotals.grossTotal.round(0);
  const roundedTaxTotal = _.reduce(taxesArr, (memo, tax) => memo.plus(tax.value), new Big('0'));
  // Rounded net price is calculated with this method to make sure net + tax = gross.
  // See VAT 28 test case
  const roundedNetTotal = roundedGrossTotal.minus(roundedTaxTotal);

  const grossPriceObj = createPriceObject({
    value: roundedGrossTotal,
    currency: opts.currency,
    zeroDecimalCurrency: isZeroDecimalCurrency(opts.currency),
  }, opts.currency);

  const pricesObj = _.merge({}, grossPriceObj, {
    net: createPriceObject({ value: roundedNetTotal }, opts.currency),
    taxes: taxesArr,
  });
  if (!cartTotals.grossDiscountTotal.eq(new Big('0'))) {
    pricesObj.discount = createPriceObject({ value: cartTotals.grossDiscountTotal }, opts.currency);
  }

  return pricesObj;
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
  isSupportedCurrency,
  getSupportedCurrencies,
};

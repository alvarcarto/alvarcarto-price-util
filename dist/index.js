'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require('lodash');
var Big = require('big.js');
var currencyFormatter = require('currency-formatter');

var _require = require('./country'),
    isEuCountry = _require.isEuCountry;

var _require2 = require('./tax'),
    calculateGrossValue = _require2.calculateGrossValue,
    calculateTaxValue = _require2.calculateTaxValue,
    calculateNetValue = _require2.calculateNetValue,
    getTaxPercentage = _require2.getTaxPercentage;

var _require3 = require('./discount'),
    addDiscountsForItems = _require3.addDiscountsForItems;

var _require4 = require('./validation'),
    validateCart = _require4.validateCart;

var _require5 = require('./stripe'),
    valueToRegularUnits = _require5.valueToRegularUnits,
    isZeroDecimalCurrency = _require5.isZeroDecimalCurrency;

var _require6 = require('./products'),
    products = _require6.products,
    supportedCurrencies = _require6.supportedCurrencies;

function taxesObjToArr(taxByP) {
  var arr = _.map(taxByP, function (value, p) {
    return { taxPercentage: new Big(p), value: value };
  });

  return _.sortBy(arr, 'taxPercentage');
}

function calculateItemBreakdown(item, currency, taxPercentage) {
  if (!_.get(item, ['product', 'grossPrices', currency])) {
    throw new Error('Item ' + item.id + ' does not have price in ' + currency + ' currency');
  }

  var itemOriginalGrossPrice = item.product.grossPrices[currency].times(item.quantity);
  var itemGrossDiscount = _.get(item.grossDiscounts, currency, new Big('0'));
  var itemGrossPrice = itemOriginalGrossPrice.minus(itemGrossDiscount);
  var itemNetPrice = calculateNetValue(itemGrossPrice, taxPercentage);
  var itemTaxValue = calculateTaxValue(itemNetPrice, taxPercentage);

  return {
    // discount has been subtracted from net, gross and tax values
    netValue: itemNetPrice,
    grossValue: itemGrossPrice,
    taxValue: itemTaxValue,
    grossDiscount: itemGrossDiscount
  };
}

function calculateExactCartTotals(cart, opts) {
  var totals = _.reduce(cart, function (memo, item) {
    var taxPercentage = getTaxPercentage(item.product, opts);
    var itemValues = calculateItemBreakdown(item, opts.currency, taxPercentage);
    var newTaxVal = _.isUndefined(memo.taxByP[taxPercentage]) ? itemValues.taxValue : memo.taxByP[taxPercentage].plus(itemValues.taxValue);

    return {
      // Net total is not returned as it is calculated from rounded values later
      grossTotal: memo.grossTotal.plus(itemValues.grossValue),
      grossDiscountTotal: memo.grossDiscountTotal.plus(itemValues.grossDiscount),
      taxByP: _.extend({}, memo.taxByP, _defineProperty({}, taxPercentage, newTaxVal))
    };
  }, {
    grossTotal: new Big('0'),
    grossDiscountTotal: new Big('0'),
    taxByP: {}
  });

  return totals;
}

function enrichAndValidateCartItems(cart, opts) {
  var cartProducts = _.map(cart, function (item) {
    var product = _.find(products, function (p) {
      return p.id === item.id;
    });
    if (!product) {
      throw new Error('No such product with id: ' + item.id);
    }

    return _.extend({}, item, { product: product });
  });

  validateCart(cartProducts);

  return _.map(cartProducts, function (item) {
    var product = item.product;

    if (!product.dynamicPrice) {
      return item;
    }

    var netPrice = new Big(item.metadata.netValue);
    var newProduct = _.extend({}, product, {
      netPrices: _defineProperty({}, opts.currency, netPrice),
      grossPrices: _defineProperty({}, opts.currency, calculateGrossValue(netPrice, product.vatPercentage))
    });

    return _.extend({}, item, { product: newProduct });
  });
}

function getSupportedCurrencies() /* shipToCountry */{
  return supportedCurrencies;
}

function createPriceObject(basePriceObj, currency) {
  var fullPriceObj = _.merge({}, basePriceObj, {
    value: Number(basePriceObj.value.toFixed(0)),
    label: formatPrice(basePriceObj.value, currency),
    humanValue: valueToRegularUnits(basePriceObj.value, currency)
  });

  return fullPriceObj;
}

function formatPrice(value, currency) {
  var regularValue = valueToRegularUnits(value, currency);
  return currencyFormatter.format(regularValue, { code: currency });
}

function calculateCartPrice(cart) {
  var _opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var opts = _.merge({
    shipToCountry: 'FI',
    currency: 'EUR'
  }, _opts);

  var cartItems = enrichAndValidateCartItems(cart, opts);
  var discountedCart = addDiscountsForItems(cartItems, opts);
  var cartTotals = calculateExactCartTotals(discountedCart, opts);

  var taxesArr = _.map(taxesObjToArr(cartTotals.taxByP), function (tax) {
    var roundedTaxValue = tax.value.round(0);
    var priceObj = createPriceObject({ value: roundedTaxValue }, opts.currency);
    return _.extend({}, priceObj, { taxPercentage: Number(tax.taxPercentage.toFixed(0)) });
  });
  var roundedGrossTotal = cartTotals.grossTotal.round(0);
  var roundedTaxTotal = _.reduce(taxesArr, function (memo, tax) {
    return memo.plus(tax.value);
  }, new Big('0'));
  // Rounded net price is calculated with this method to make sure net + tax = gross.
  // See VAT 28 test case
  var roundedNetTotal = roundedGrossTotal.minus(roundedTaxTotal);

  var grossPriceObj = createPriceObject({
    value: roundedGrossTotal,
    currency: opts.currency,
    zeroDecimalCurrency: isZeroDecimalCurrency(opts.currency)
  }, opts.currency);

  var pricesObj = _.merge({}, grossPriceObj, {
    net: createPriceObject({ value: roundedNetTotal }, opts.currency),
    taxes: taxesArr
  });
  if (!cartTotals.grossDiscountTotal.eq(new Big('0'))) {
    pricesObj.discount = createPriceObject({ value: cartTotals.grossDiscountTotal }, opts.currency);
  }

  return pricesObj;
}

function calculateItemPrice(item) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (opts.onlyUnitPrice) {
    var unitItem = _.extend({}, item, { quantity: 1 });
    return calculateCartPrice([unitItem], opts);
  }

  if (!_.isInteger(item.quantity)) {
    throw new Error('Item quantity should be an integer. Item: ' + item);
  }
  if (item.quantity < 1) {
    throw new Error('Item quantity should at least 1. Item: ' + item);
  }

  return calculateCartPrice([item], opts);
}

module.exports = {
  calculateCartPrice: calculateCartPrice,
  calculateItemPrice: calculateItemPrice,
  isEuCountry: isEuCountry,
  getSupportedCurrencies: getSupportedCurrencies
};
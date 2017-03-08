'use strict';

var _ = require('lodash');

// TODO: Use currency lib
var SYMBOLS = {
  EUR: '\u20AC'
};

function calculateCartPrice(cart) {
  var total = _.reduce(cart, function (memo, item) {
    var itemPrice = calculateItemPrice(item);
    return {
      value: memo.value + itemPrice.value,
      currency: itemPrice.currency
    };
  }, { value: 0, currency: null });

  total.label = _toLabel(total);
  return total;
}

function calculateItemPrice(item) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var price = calculateUnitPrice(item.size);

  if (!opts.onlyUnitPrice) {
    if (!_.isInteger(item.quantity)) {
      throw new Error('Item quantity should be an integer. Item: ' + item);
    }

    price.value *= item.quantity;
  }

  price.label = _toLabel(price);
  return price;
}

function calculateUnitPrice(size) {
  switch (size) {
    case '30x40cm':
      return { value: 39, currency: 'EUR' };
    case '50x70cm':
      return { value: 49, currency: 'EUR' };
    case '70x100cm':
      return { value: 69, currency: 'EUR' };
    default:
      throw new Error('Invalid size: ' + size);
  }
}

function _toLabel(price) {
  return price.value.toFixed(2) + ' ' + getCurrencySymbol(price.currency);
}

function getCurrencySymbol(currency) {
  if (!_.has(SYMBOLS, currency.toUpperCase())) {
    throw new Error('Unknown currency: ' + currency);
  }

  return SYMBOLS[currency.toUpperCase()];
}

module.exports = {
  calculateCartPrice: calculateCartPrice,
  calculateItemPrice: calculateItemPrice,
  calculateUnitPrice: calculateUnitPrice,
  getCurrencySymbol: getCurrencySymbol
};
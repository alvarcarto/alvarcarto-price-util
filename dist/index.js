'use strict';

var _ = require('lodash');

// TODO: Use currency lib
var SYMBOLS = {
  EUR: '\u20AC'
};

// Price value is in cents
function calculateCartPrice(cart, promotion) {
  var total = _.reduce(cart, function (memo, item) {
    var itemPrice = calculateItemPrice(item);
    return {
      value: memo.value + itemPrice.value,
      currency: itemPrice.currency
    };
  }, { value: 0, currency: null });

  var totalPriceObj = _createPriceObject(total);
  return _calculateDiscountTotal(totalPriceObj, promotion);
}

function calculateItemPrice(item) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var price = calculateUnitPrice(item.size);

  if (!opts.onlyUnitPrice) {
    if (!_.isInteger(item.quantity)) {
      throw new Error('Item quantity should be an integer. Item: ' + item);
    }
    if (item.quantity < 1) {
      throw new Error('Item quantity should at least 1. Item: ' + item);
    }

    price.value *= item.quantity;
  }

  return price;
}

function calculateUnitPrice(size) {
  switch (size) {
    case '30x40cm':
      return _createPriceObject({ value: 3900, currency: 'EUR' });
    case '50x70cm':
      return _createPriceObject({ value: 4900, currency: 'EUR' });
    case '70x100cm':
      return _createPriceObject({ value: 6900, currency: 'EUR' });
    default:
      throw new Error('Invalid size: ' + size);
  }
}

function _calculateDiscountTotal(total, promotion) {
  if (!promotion) {
    return total;
  }

  if (_.get(promotion, 'hasExpired')) {
    throw new Error('Promotion (' + promotion.promotionCode + ') has expired');
  }

  var discount = promotionToDiscount(total, promotion);
  var newTotal = _createPriceObject({
    value: total.value - discount.value,
    currency: total.currency
  });

  return _.merge({}, newTotal, { discount: discount });
}

function promotionToDiscount(total, promotion) {
  switch (promotion.type) {
    case 'FIXED':
      if (total.currency !== promotion.currency) {
        throw new Error('Promotion currency mismatches the total value: ' + total.currency + ' !== ' + promotion.currency);
      }
      return _createPriceObject({
        value: promotion.value,
        currency: promotion.currency
      });

    case 'PERCENTAGE':
      return _createPriceObject({
        // total.value is total price in the currency's lowest amount, e.g. cents
        // promotion.value is a factor, e.g. 0.2 (-20%) to describe the percentage
        // discount
        value: Math.round(total.value * promotion.value),
        currency: total.currency
      });

    default:
      throw new Error('Invalid promotion type: ' + promotion.type);
  }
}

function _createPriceObject(basicPriceObj) {
  var fullPriceObj = _.merge({}, basicPriceObj, {
    label: _toLabel(basicPriceObj),
    humanValue: _toHumanValue(basicPriceObj)
  });

  return fullPriceObj;
}

function _toLabel(price) {
  return _toHumanValue(price) + ' ' + getCurrencySymbol(price.currency);
}

function _toHumanValue(price) {
  return (price.value / 100.0).toFixed(2);
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
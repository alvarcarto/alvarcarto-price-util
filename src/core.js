const _ = require('lodash');
const { isEuCountry } = require('./country');

const FINLAND_VAT_PERCENTAGE = 24.0;

// TODO: Use currency lib
const SYMBOLS = {
  EUR: '\u20AC',
};

function calculateUnitPriceForSpecialItem(item) {
  switch (item.type) {
    case 'physicalGiftCard':
      return _createPriceObject({ value: 690, currency: 'EUR' });
    case 'giftCardValue':
      if (item.value < 1000) {
        throw new Error(`Gift card value must be at least 1000. Got: ${item.value}`);
      }
      return _createPriceObject({ value: item.value, currency: 'EUR' });
    case 'mapPoster':
      return calculateUnitPrice(item.size);
    default:
      throw new Error(`Invalid item type: ${item.type}`);
  }
}

function _addTax(totalPrice, taxPercentage) {
  const grossValue = totalPrice.value;
  const taxObj = _.merge({}, _createPriceObject({
    value: getTaxValue(grossValue, taxPercentage),
    currency: totalPrice.currency,
  }), {
    taxPercentage,
  });

  const netObj = _createPriceObject({
    value: getNetValue(grossValue, taxPercentage),
    currency: totalPrice.currency,
  });

  return _.merge({}, totalPrice, {
    net: netObj,
    tax: taxObj,
  });
}

function getNetValue(grossValue, taxPercentage) {
  const taxValue = getTaxValue(grossValue, taxPercentage);
  return Math.round(grossValue - taxValue);  // in cents
}

function getTaxValue(grossValue, taxPercentage) {
  const taxFactor = taxPercentage / 100.0;
  const netValue = grossValue / (1.0 + taxFactor);
  const taxValue = grossValue - netValue;
  return Math.round(taxValue);  // in cents
}

function _calculateDiscountTotal(total, opts = {}) {
  const { promotion } = opts;
  if (!promotion) {
    return total;
  }

  if (!opts.ignorePromotionExpiry && _.get(promotion, 'hasExpired')) {
    throw new Error(`Promotion (${promotion.promotionCode}) has expired`);
  }

  const discount = promotionToDiscount(total, promotion);
  const newTotal = _createPriceObject({
    value: total.value - discount.value,
    currency: total.currency,
  });

  return _.merge({}, newTotal, { discount });
}

// IMPORTANT!
// _createDiscountPriceObject must be used to create the discount price
function promotionToDiscount(total, promotion) {
  switch (promotion.type) {
    case 'FIXED':
      if (total.currency !== promotion.currency) {
        throw new Error(`Promotion currency mismatches the total value: ${total.currency} !== ${promotion.currency}`);
      }
      return _createDiscountPriceObject(total.value, {
        value: promotion.value,
        currency: promotion.currency,
      });

    case 'PERCENTAGE':
      return _createDiscountPriceObject(total.value, {
        // total.value is total price in the currency's lowest amount, e.g. cents
        // promotion.value is a factor, e.g. 0.2 (-20%) to describe the percentage
        // discount
        value: Math.round(total.value * promotion.value),
        currency: total.currency,
      });

    default:
      throw new Error(`Invalid promotion type: ${promotion.type}`);
  }
}

function _createDiscountPriceObject(totalValue, promotionPriceObj) {
  return _createPriceObject({
    // Make sure the discount can't be more than the total value.
    value: Math.min(totalValue, promotionPriceObj.value),
    currency: promotionPriceObj.currency,
  });
}

function _createPriceObject(basicPriceObj) {
  const fullPriceObj = _.merge({}, basicPriceObj, {
    label: _toLabel(basicPriceObj),
    humanValue: _toHumanValue(basicPriceObj),
  });

  return fullPriceObj;
}

function _toLabel(price) {
  return `${_toHumanValue(price)} ${getCurrencySymbol(price.currency)}`;
}

function _toHumanValue(price) {
  return (price.value / 100.0).toFixed(2);
}

module.exports = {
  calculateCartPrice,
  calculateItemPrice,
  calculateUnitPrice,
  getCurrencySymbol,
};

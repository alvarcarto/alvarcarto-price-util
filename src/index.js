const _ = require('lodash');
const { isEuCountry } = require('./country');

const FINLAND_VAT_PERCENTAGE = 24.0;

// TODO: Use currency lib
const SYMBOLS = {
  EUR: '\u20AC',
};

// Price value is in cents
function calculateCartPrice(cart, opts = {}) {
  const total = calculateTotalForItems(cart);
  const totalPriceObj = _createPriceObject(total);

  const mapCart = _.filter(cart, item => !item.type || item.type === 'mapPoster');
  const mapsTotal = calculateTotalForItems(mapCart);
  const mapsTotalPriceObj = _createPriceObject(mapsTotal);

  const discountedPriceObj = _calculateDiscountTotal(totalPriceObj, mapsTotalPriceObj, opts);
  if (!opts.shipToCountry && !opts.taxPercentage) {
    return discountedPriceObj;
  }

  let taxPercentage;
  if (opts.taxPercentage) {
    taxPercentage = opts.taxPercentage;
  } else {
    taxPercentage = isEuCountry(opts.shipToCountry) ? FINLAND_VAT_PERCENTAGE : 0;
  }

  return _addTax(discountedPriceObj, taxPercentage);
}

function calculateItemPrice(item, opts = {}) {
  const price = _.isString(item.type)
    ? calculateUnitPriceForSpecialItem(item)
    : calculateUnitPrice(item.size);

  if (!opts.onlyUnitPrice) {
    if (!_.isInteger(item.quantity)) {
      throw new Error(`Item quantity should be an integer. Item: ${item}`);
    }
    if (item.quantity < 1) {
      throw new Error(`Item quantity should at least 1. Item: ${item}`);
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
      throw new Error(`Invalid size: ${size}`);
  }
}

function getItemLabel(item) {
  switch (item.type) {
    case 'shippingClass':
      return `${_.upperFirst(_.toLower(item.value))} Shipping`;
    case 'productionClass':
      return `Priority production`;
    case 'physicalGiftCard':
      return 'Premium gift card';
    case 'giftCardValue':
      return `Gift card value`;
    default:
      if (item.labelsEnabled && item.labelHeader) {
        return `Poster of ${item.labelHeader}, ${item.size}`;
      }

      return `Poster, ${item.size}`;
  }
}

function calculateUnitPriceForSpecialItem(item) {
  switch (item.type) {
    case 'physicalGiftCard':
      return _createPriceObject({ value: 690, currency: 'EUR' });
    case 'giftCardValue':
      if (item.value < 1000) {
        throw new Error(`Gift card value must be at least 1000. Got: ${item.value}`);
      }
      return _createPriceObject({ value: item.value, currency: 'EUR' });
    case 'productionClass':
      if (item.quantity !== 1) {
        throw new Error('Quantity for productionClass must be 1.');
      }

      if (item.value === 'HIGH') {
        return _createPriceObject({ value: 1500, currency: 'EUR' });
      }

      return _createPriceObject({ value: 0, currency: 'EUR' });
    case 'shippingClass':
      if (item.quantity !== 1) {
        throw new Error('Quantity for shippingClass must be 1.');
      }

      // Shipping is free at the moment
      return _createPriceObject({ value: 0, currency: 'EUR' });
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

function calculateTotalForItems(cart) {
  const total = _.reduce(cart, (memo, item) => {
    const itemPrice = calculateItemPrice(item);
    return {
      value: memo.value + itemPrice.value,
      currency: itemPrice.currency,
    };
  }, { value: 0, currency: 'EUR' });

  return total;
}

function _calculateDiscountTotal(total, discountableTotal, opts = {}) {
  const { promotion } = opts;
  if (!promotion) {
    return total;
  }

  if (!opts.ignorePromotionExpiry && _.get(promotion, 'hasExpired')) {
    throw new Error(`Promotion (${promotion.promotionCode}) has expired`);
  }

  const resolvedDiscountableTotal = _.startsWith(promotion.promotionCode, 'PLATINUM')
    ? total
    : discountableTotal;

  const discount = promotionToDiscount(resolvedDiscountableTotal, promotion);
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

function getCurrencySymbol(currency) {
  if (!currency || !_.has(SYMBOLS, currency.toUpperCase())) {
    throw new Error(`Unknown currency: ${currency}`);
  }

  return SYMBOLS[currency.toUpperCase()];
}

module.exports = {
  calculateCartPrice,
  calculateItemPrice,
  calculateUnitPrice,
  getCurrencySymbol,
  getItemLabel,
};

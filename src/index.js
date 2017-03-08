const _ = require('lodash');

// TODO: Use currency lib
const SYMBOLS = {
  EUR: '\u20AC',
};

// Price value is in cents
function calculateCartPrice(cart) {
  const total = _.reduce(cart, (memo, item) => {
    const itemPrice = calculateItemPrice(item);
    return {
      value: memo.value + itemPrice.value,
      currency: itemPrice.currency,
    };
  }, { value: 0, currency: null });

  total.label = _toLabel(total);
  total.humanValue = _toHumanValue(total);
  return total;
}

function calculateItemPrice(item, opts = {}) {
  const price = calculateUnitPrice(item.size);

  if (!opts.onlyUnitPrice) {
    if (!_.isInteger(item.quantity)) {
      throw new Error(`Item quantity should be an integer. Item: ${item}`);
    }

    price.value *= item.quantity;
  }

  price.label = _toLabel(price);
  price.humanValue = _toHumanValue(price);
  return price;
}

function calculateUnitPrice(size) {
  switch (size) {
    case '30x40cm':
      return { value: 3900, currency: 'EUR' };
    case '50x70cm':
      return { value: 4900, currency: 'EUR' };
    case '70x100cm':
      return { value: 6900, currency: 'EUR' };
    default:
      throw new Error(`Invalid size: ${size}`);
  }
}

function _toLabel(price) {
  return `${_toHumanValue(price)} ${getCurrencySymbol(price.currency)}`;
}

function _toHumanValue(price) {
  return (price.value / 100.0).toFixed(2);
}

function getCurrencySymbol(currency) {
  if (!_.has(SYMBOLS, currency.toUpperCase())) {
    throw new Error(`Unknown currency: ${currency}`);
  }

  return SYMBOLS[currency.toUpperCase()];
}

module.exports = {
  calculateCartPrice,
  calculateItemPrice,
  calculateUnitPrice,
  getCurrencySymbol,
};

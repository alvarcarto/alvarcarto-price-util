const _ = require('lodash');
const { isEuCountry } = require('./country');
const { getProductUnitPrice } = require('./pricing');

const FINLAND_VAT_PERCENTAGE = 24.0;

const SYMBOLS = {
  EUR: '\u20AC',
};

// Price value is in cents
function calculateCartPrice(cart, opts = {}) {
  const total = _.reduce(cart, (memo, item) => {
    const itemPrice = calculateItemPrice(item);
    return {
      value: memo.value + itemPrice.value,
      currency: itemPrice.currency,
    };
  }, { value: 0, currency: null });

  const totalPriceObj = _createPriceObject(total);
  const discountedPriceObj = _calculateDiscountTotal(totalPriceObj, opts);
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
  const unitPrice = getProductUnitPrice(item);

  if (opts.onlyUnitPrice) {
    return createPriceObject(unitPrice);
  }

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

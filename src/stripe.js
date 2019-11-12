const _ = require('lodash');

const STRIPE_ZERO_DECIMAL_CURRENCIES = [
  'JPY', 'BIF', 'CLP', 'DJF', 'GNF',
  'KMF', 'KRW', 'MGA', 'PYG', 'RWF',
  'UGX', 'VND', 'VUV', 'XAF', 'XOF',
  'XPF',
];

function isZeroDecimalCurrency(currency) {
  return _.includes(STRIPE_ZERO_DECIMAL_CURRENCIES, currency);
}

function valueToRegularUnits(stripeVal, currency) {
  if (isZeroDecimalCurrency(currency)) {
    return stripeVal.toFixed(0);
  }

  return stripeVal.div(100).toFixed(2);
}

module.exports = {
  isZeroDecimalCurrency,
  valueToRegularUnits,
  STRIPE_ZERO_DECIMAL_CURRENCIES,
};

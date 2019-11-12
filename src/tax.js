const Big = require('big.js');
const { isEuCountry } = require('./country');

function getTaxPercentage(product, opts) {
  const taxPercentage = isEuCountry(opts.shipToCountry)
    ? product.vatPercentage
    : new Big('0');
  return taxPercentage;
}

function calculateGrossValue(netValue, taxPercentage) {
  const taxValue = calculateTaxValue(netValue, taxPercentage);
  return netValue.plus(taxValue);
}

function calculateNetValue(grossValue, taxPercentage) {
  const taxFactor = taxPercentage.div(100);
  const netValue = grossValue.div(new Big(1.0).plus(taxFactor));
  return netValue;
}

function calculateTaxValue(netValue, taxPercentage) {
  const taxFactor = taxPercentage.div(100);
  const grossValue = netValue.times(new Big(1.0).plus(taxFactor));
  return grossValue.minus(netValue);
}

module.exports = {
  getTaxPercentage,
  calculateNetValue,
  calculateGrossValue,
  calculateTaxValue,
};


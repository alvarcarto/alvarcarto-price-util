'use strict';

var Big = require('big.js');

var _require = require('./country'),
    isEuCountry = _require.isEuCountry;

function getTaxPercentage(product, opts) {
  var taxPercentage = isEuCountry(opts.shipToCountry) ? product.vatPercentage : new Big('0');
  return taxPercentage;
}

function calculateGrossValue(netValue, taxPercentage) {
  var taxValue = calculateTaxValue(netValue, taxPercentage);
  return netValue.plus(taxValue);
}

function calculateNetValue(grossValue, taxPercentage) {
  var taxFactor = taxPercentage.div(100);
  var netValue = grossValue.div(new Big(1.0).plus(taxFactor));
  return netValue;
}

function calculateTaxValue(netValue, taxPercentage) {
  var taxFactor = taxPercentage.div(100);
  var grossValue = netValue.times(new Big(1.0).plus(taxFactor));
  return grossValue.minus(netValue);
}

module.exports = {
  getTaxPercentage: getTaxPercentage,
  calculateNetValue: calculateNetValue,
  calculateGrossValue: calculateGrossValue,
  calculateTaxValue: calculateTaxValue
};
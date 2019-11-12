'use strict';

var _ = require('lodash');
var RULE_FUNCTIONS = require('./rules');

function forEachCartItemAssert(cart, func) {
  var cartErrs = _.map(cart, function (item) {
    return func(item);
  });

  _.forEach(cartErrs, function (itemErrs, itemIndex) {
    _.forEach(itemErrs, function (msg) {
      if (msg) {
        var errItem = cart[itemIndex];
        var err = new Error('Error in cart item ' + errItem.id + ' (index=' + itemIndex + '): ' + msg);
        throw err;
      }
    });
  });
}

function validateDynamicPrice(item) {
  if (!_.isPlainObject(item.metadata)) {
    throw new Error('No metadata object found for dynamic priced item ' + item.id);
  }

  if (!_.isFinite(item.metadata.netValue)) {
    throw new Error('No metadata.netValue found for dynamic priced item ' + item.id);
  }
}

function validateCartItem(item) {
  if (item.product.dynamicPrice) {
    validateDynamicPrice(item);
  }

  if (!_.isInteger(item.quantity)) {
    throw new Error('Item quantity should be an integer');
  }
}

function validateCart(cart) {
  forEachCartItemAssert(cart, function (item) {
    return validateCartItem(item);
  });
  validateRulesForCart(cart);
}

function validateRulesForCart(cart) {
  return forEachCartItemAssert(cart, function (item) {
    if (!item.product.rules) {
      return [];
    }

    return getRuleErrorsForItem(item);
  });
}

function getRuleErrorsForItem(item) {
  var rules = item.product.rules;

  var itemErrs = _.map(rules, function (rule) {
    var ruleFunc = RULE_FUNCTIONS[rule.type];
    return ruleFunc(rule, item);
  });
  return itemErrs;
}

module.exports = {
  validateCart: validateCart,
  validateDynamicPrice: validateDynamicPrice
};
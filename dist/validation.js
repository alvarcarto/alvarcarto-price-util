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
        var err = new Error('Error in cart item ' + errItem.sku + ' (index=' + itemIndex + '): ' + msg);
        throw err;
      }
    });
  });
}

function validateDynamicPrice(item) {
  if (!_.isPlainObject(item.customisation)) {
    throw new Error('No customisation object found for dynamic priced item ' + item.sku);
  }

  if (!_.isFinite(item.customisation.netValue)) {
    throw new Error('No customisation.netValue found for dynamic priced item ' + item.sku);
  }
}

function validateCartItem(item) {
  if (item.product.dynamicPrice) {
    validateDynamicPrice(item);
  }

  if (!_.isInteger(item.quantity)) {
    throw new Error('Item quantity should be an integer');
  }

  if (item.quantity < 1) {
    throw new Error('Item quantity must be at least 1');
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
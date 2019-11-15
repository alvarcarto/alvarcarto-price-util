const _ = require('lodash');
const RULE_FUNCTIONS = require('./rules');

function forEachCartItemAssert(cart, func) {
  const cartErrs = _.map(cart, item => func(item));

  _.forEach(cartErrs, (itemErrs, itemIndex) => {
    _.forEach(itemErrs, (msg) => {
      if (msg) {
        const errItem = cart[itemIndex];
        const err = new Error(`Error in cart item ${errItem.id} (index=${itemIndex}): ${msg}`);
        throw err;
      }
    });
  });
}

function validateDynamicPrice(item) {
  if (!_.isPlainObject(item.customisation)) {
    throw new Error(`No customisation object found for dynamic priced item ${item.id}`);
  }

  if (!_.isFinite(item.customisation.netValue)) {
    throw new Error(`No customisation.netValue found for dynamic priced item ${item.id}`);
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
  forEachCartItemAssert(cart, item => validateCartItem(item));
  validateRulesForCart(cart);
}

function validateRulesForCart(cart) {
  return forEachCartItemAssert(cart, (item) => {
    if (!item.product.rules) {
      return [];
    }

    return getRuleErrorsForItem(item);
  });
}

function getRuleErrorsForItem(item) {
  const { rules } = item.product;
  const itemErrs = _.map(rules, (rule) => {
    const ruleFunc = RULE_FUNCTIONS[rule.type];
    return ruleFunc(rule, item);
  });
  return itemErrs;
}

module.exports = {
  validateCart,
  validateDynamicPrice,
};

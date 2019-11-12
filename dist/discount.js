'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require('lodash');
var Big = require('big.js');

var _require = require('./big-utils'),
    bigMin = _require.bigMin;

function fixedPromotionToGrossDiscounts(item, promotion, alreadyDiscountedCartItems) {
  var itemGrossValue = item.product.grossPrices[promotion.currency].times(item.quantity);
  var promotionValueUsed = _.reduce(alreadyDiscountedCartItems, function (memo, cartItem) {
    var itemDiscountValue = _.get(cartItem.grossDiscounts, promotion.currency, new Big('0'));
    return memo.plus(itemDiscountValue);
  }, new Big('0'));

  var promotionValueLeft = new Big(promotion.value).round(0).minus(promotionValueUsed);

  // Fixed discounts are tied to a single currency
  return _defineProperty({}, promotion.currency, bigMin(promotionValueLeft, itemGrossValue));
}

// Percentage discounts can be calculated for each currency
function percentagePromotionToGrossDiscounts(item, promotion) {
  var grossDiscounts = {};

  _.forEach(item.product.grossPrices, function (unitGrossValue, currency) {
    var itemGrossValue = unitGrossValue.times(item.quantity);
    // promotion.value is a factor, e.g. 0.2 (-20%) to describe the percentage
    // discount
    var discountValue = itemGrossValue.times(new Big(promotion.value));

    // Make sure the discount can't be more than the total value.
    grossDiscounts[currency] = bigMin(discountValue, itemGrossValue);
  });

  return grossDiscounts;
}

function addGrossDiscounts(promotion, item, alreadyDiscountedCartItems) {
  if (!promotion) {
    return item;
  }

  var promotionDiscountClass = _.startsWith(promotion.promotionCode, 'PLATINUM') ? 1 : 0;

  // If the promotion code does not cover the product, don't add discount
  if (item.product.discountClass > promotionDiscountClass) {
    return item;
  }

  var grossDiscounts = {};
  if (promotion.type === 'FIXED') {
    grossDiscounts = fixedPromotionToGrossDiscounts(item, promotion, alreadyDiscountedCartItems);
  } else if (promotion.type === 'PERCENTAGE') {
    grossDiscounts = percentagePromotionToGrossDiscounts(item, promotion);
  } else {
    throw new Error('Invalid promotion type: ' + promotion.type);
  }

  return _.extend({}, item, { grossDiscounts: grossDiscounts });
}

function addDiscountsForItems(cart) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var promotion = opts.promotion;

  if (!promotion) {
    return cart;
  }

  if (opts.promotion.type !== 'PERCENTAGE' && opts.promotion.currency !== opts.currency) {
    throw new Error('Promotion currency (' + opts.promotion.currency + ') mismatches the requested currency (' + opts.currency + ')');
  }

  if (!opts.ignorePromotionExpiry && _.get(promotion, 'hasExpired')) {
    throw new Error('Promotion (' + promotion.promotionCode + ') has expired');
  }

  var discountedCartItems = _.reduce(cart, function (memo, item) {
    return memo.concat([addGrossDiscounts(promotion, item, memo)]);
  }, []);
  return discountedCartItems;
}

module.exports = {
  addDiscountsForItems: addDiscountsForItems
};
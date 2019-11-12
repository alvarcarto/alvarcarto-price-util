const _ = require('lodash');
const Big = require('big.js');
const { bigMin } = require('./big-utils');

function fixedPromotionToGrossDiscounts(item, promotion, alreadyDiscountedCartItems) {
  console.log('product', item.product)
  const itemGrossValue = item.product.grossPrices[promotion.currency].times(item.quantity);
  console.log('itemGrossValue', itemGrossValue.toFixed(2))
  const promotionValueUsed = _.reduce(alreadyDiscountedCartItems, (memo, cartItem) => {
    const itemDiscountValue = _.get(cartItem.grossDiscounts, promotion.currency, new Big('0'));
    return memo.plus(itemDiscountValue);
  }, new Big('0'));

  console.log('promotionValueUsed', promotionValueUsed.toFixed(2))

  const promotionValueLeft = new Big(promotion.value).round(0).minus(promotionValueUsed);
  console.log('promotionValueLeft', promotionValueLeft.toFixed(2))

  // Fixed discounts are tied to a single currency
  return {
    // Make sure the discount can't be more than the total value.
    [promotion.currency]: bigMin(promotionValueLeft, itemGrossValue),
  };
}

// Percentage discounts can be calculated for each currency
function percentagePromotionToGrossDiscounts(item, promotion) {
  const grossDiscounts = {};

  _.forEach(item.product.grossPrices, (unitGrossValue, currency) => {
    const itemGrossValue = unitGrossValue.times(item.quantity);
    // promotion.value is a factor, e.g. 0.2 (-20%) to describe the percentage
    // discount
    const discountValue = itemGrossValue.times(new Big(promotion.value));

    // Make sure the discount can't be more than the total value.
    grossDiscounts[currency] = bigMin(discountValue, itemGrossValue);
  });

  return grossDiscounts;
}

function addGrossDiscounts(promotion, item, alreadyDiscountedCartItems) {
  if (!promotion) {
    return item;
  }

  const promotionDiscountClass = _.startsWith(promotion.promotionCode, 'PLATINUM')
    ? 1
    : 0;

  // If the promotion code does not cover the product, don't add discount
  if (item.product.discountClass > promotionDiscountClass) {
    return item;
  }

  let grossDiscounts = {};
  if (promotion.type === 'FIXED') {
    grossDiscounts = fixedPromotionToGrossDiscounts(item, promotion, alreadyDiscountedCartItems);
  } else if (promotion.type === 'PERCENTAGE') {
    grossDiscounts = percentagePromotionToGrossDiscounts(item, promotion);
  } else {
    throw new Error(`Invalid promotion type: ${promotion.type}`);
  }

  return _.extend({}, item, { grossDiscounts });
}

function addDiscountsForItems(cart, opts = {}) {
  const { promotion } = opts;
  if (!promotion) {
    return cart;
  }

  if (opts.promotion.type !== 'PERCENTAGE' && opts.promotion.currency !== opts.currency) {
    throw new Error(`Promotion currency (${opts.promotion.currency}) mismatches the requested currency (${opts.currency})`);
  }

  if (!opts.ignorePromotionExpiry && _.get(promotion, 'hasExpired')) {
    throw new Error(`Promotion (${promotion.promotionCode}) has expired`);
  }

  const discountedCartItems = _.reduce(cart, (memo, item) => {
    return memo.concat([addGrossDiscounts(promotion, item, memo)]);
  }, []);
  return discountedCartItems;
}

module.exports = {
  addDiscountsForItems,
};

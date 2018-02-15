const _ = require('lodash');

const productTypes = {
  mapPoster: {
    prices: {
      EUR: item => getMapPosterValue(item.size, { currency: 'EUR' }),
      USD: item => getMapPosterValue(item.size, { currency: 'USD' }),
    }
    // Use categories and map categories per country?
    // Or just list all countries?
    vatCategory:
    {
      OTHER: 0.0,
      EU: 24.0,
    },
  },
  giftCardValue: {
    value: item => item.value,
    currency: 'EUR',
    vatPercentage: {
      OTHER: 0.0,
      EU: 24.0,
    },
  },
  physicalGiftCard: {
    value: 690,
    currency: 'EUR',
    vatPercentage: {
      OTHER: 0.0,
      EU: 24.0,
    },
  },
  expressDelivery: {
    value: 1500,
    currency: 'EUR',
    vatPercentage: {
      OTHER: 0.0,
      EU: 24.0,
    },
  },
};

function getMapPosterValue(size) {
  switch (size) {
    case '30x40cm':
      return 3900;  // 4900 USD
    case '50x70cm':
      return 4900;  // 5900 USD
    case '70x100cm':
      return 6900;  // 7900 USD
    default:
      throw new Error(`Invalid size: ${size}`);
  }
}

function getProductUnitPrice(item) {
  const productType = _.get(item, 'type', 'mapPoster');
  if (!_.has(productTypes, productType)) {
    throw new Error(`Unknown product type: ${productType}`);
  }

  const unitPrice = _.cloneDeep(productTypes[item.type]);
  if (!_.isFunction(unitPrice.value)) {
    return unitPrice;
  }

  return _.merge({}, unitPrice, {
    // Dynamically resolve item value based on other attributes
    value: unitPrice.value(item),
  });
}

module.exports = {
  getProductUnitPrice,
};

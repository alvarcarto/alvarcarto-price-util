'use strict';

var Big = require('big.js');
var _ = require('lodash');

var _require = require('./tax'),
    calculateNetValue = _require.calculateNetValue,
    calculateGrossValue = _require.calculateGrossValue;

var products = [{
  sku: 'custom-map-print-30x40cm',
  name: {
    'en-US': 'Map print 30x40cm',
    'fi-FI': 'Karttajuliste 30x40cm'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    39 EUR = 43.15 USD ~ *44.9 USD*  (= 40.58 EUR)
    39 EUR = 4713.47 JPY ~ *4699 JPY*  (= 38.88 EUR)
    39 EUR = 62.62 AUD ~ *64.9 AUD*  (= 40.42 EUR)
    39 EUR = 33.50 GBP ~ *32.9 GBP*  (= 38.31 EUR)
    39 EUR = 56.78 CAD ~ *54.9 CAD*  (= 37.71 EUR)
    39 EUR = 417.17 SEK ~ *419 SEK*  (= 39.17 EUR)
    39 EUR = 291.42 DKK ~ *289 DKK*  (= 38.68 EUR)
    39 EUR = 396.34 NOK ~ *399 NOK*  (= 39.26 EUR)
    */

    EUR: new Big(3900),
    USD: new Big(4490),
    // https://stripe.com/docs/currencies
    // JPY is zero-decimal currency
    // meaning they are not multiplied by 100
    JPY: new Big(4699),
    AUD: new Big(6490),
    GBP: new Big(3290),
    CAD: new Big(5490),
    SEK: new Big(41900),
    DKK: new Big(28900),
    NOK: new Big(39900)
  }
}, {
  sku: 'custom-map-print-50x70cm',
  name: {
    'en-US': 'Map print 50x70cm',
    'fi-FI': 'Karttajuliste 50x70cm'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    49 EUR = 54.22 USD ~ *54.9 USD*  (= 49.62 EUR)
    49 EUR = 5922.05 JPY ~ *5899 JPY*  (= 48.81 EUR)
    49 EUR = 78.68 AUD ~ *79 AUD*  (= 49.20 EUR)
    49 EUR = 42.08 GBP ~ *41.9 GBP*  (= 48.79 EUR)
    49 EUR = 71.34 CAD ~ *69 CAD*  (= 47.39 EUR)
    49 EUR = 524.14 SEK ~ *519 SEK*  (= 48.52 EUR)
    49 EUR = 366.15 DKK ~ *369 DKK*  (= 49.38 EUR)
    49 EUR = 497.97 NOK ~ *499 NOK*  (= 49.10 EUR)
    */

    EUR: new Big(4900),
    USD: new Big(5490),
    JPY: new Big(5899),
    AUD: new Big(7900),
    GBP: new Big(4190),
    CAD: new Big(6900),
    SEK: new Big(51900),
    DKK: new Big(36900),
    NOK: new Big(49900)
  }
}, {
  sku: 'custom-map-print-70x100cm',
  name: {
    'en-US': 'Map print 70x100cm',
    'fi-FI': 'Karttajuliste 70x100cm'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    69 EUR = 76.35 USD ~ *74.9 USD*  (= 67.69 EUR)
    69 EUR = 8339.22 JPY ~ *8299 JPY*  (= 68.67 EUR)
    69 EUR = 110.79 AUD ~ *109 AUD*  (= 67.88 EUR)
    69 EUR = 59.26 GBP ~ *58.9 GBP*  (= 68.58 EUR)
    69 EUR = 100.46 CAD ~ *99 CAD*  (= 68.00 EUR)
    69 EUR = 738.08 SEK ~ *739 SEK*  (= 69.09 EUR)
    69 EUR = 515.59 DKK ~ *519 DKK*  (= 69.46 EUR)
    69 EUR = 701.22 NOK ~ *699 NOK*  (= 68.78 EUR)
    */

    EUR: new Big(6900),
    USD: new Big(7490),
    JPY: new Big(8299),
    AUD: new Big(10900),
    GBP: new Big(5890),
    CAD: new Big(9900),
    SEK: new Big(73900),
    DKK: new Big(51900),
    NOK: new Big(69900)
  }
}, {
  sku: 'custom-map-print-12x18inch',
  name: {
    'en-US': 'Map print 12x18inch',
    'fi-FI': 'Karttajuliste 12x18inch'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    41.9 EUR = 46.39 USD ~ *44.9 USD*  (= 40.55 EUR)
    41.9 EUR = 5064.93 JPY ~ *5099 JPY*  (= 42.18 EUR)
    41.9 EUR = 67.29 AUD ~ *64.9 AUD*  (= 40.41 EUR)
    41.9 EUR = 36.00 GBP ~ *35.9 GBP*  (= 41.78 EUR)
    41.9 EUR = 61.07 CAD ~ *59 CAD*  (= 40.48 EUR)
    41.9 EUR = 448.40 SEK ~ *449 SEK*  (= 41.96 EUR)
    41.9 EUR = 313.10 DKK ~ *309 DKK*  (= 41.35 EUR)
    41.9 EUR = 425.89 NOK ~ *429 NOK*  (= 42.21 EUR)
    */

    EUR: new Big(4190),
    USD: new Big(4490),
    JPY: new Big(5099),
    AUD: new Big(6490),
    GBP: new Big(3590),
    CAD: new Big(5900),
    SEK: new Big(44900),
    DKK: new Big(30900),
    NOK: new Big(42900)
  }
}, {
  sku: 'custom-map-print-18x24inch',
  name: {
    'en-US': 'Map print 18x24inch',
    'fi-FI': 'Karttajuliste 18x24inch'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    49 EUR = 54.22 USD ~ *54.9 USD*  (= 49.62 EUR)
    49 EUR = 5922.05 JPY ~ *5899 JPY*  (= 48.81 EUR)
    49 EUR = 78.68 AUD ~ *79 AUD*  (= 49.20 EUR)
    49 EUR = 42.08 GBP ~ *41.9 GBP*  (= 48.79 EUR)
    49 EUR = 71.34 CAD ~ *69 CAD*  (= 47.39 EUR)
    49 EUR = 524.14 SEK ~ *519 SEK*  (= 48.52 EUR)
    49 EUR = 366.15 DKK ~ *369 DKK*  (= 49.38 EUR)
    49 EUR = 497.97 NOK ~ *499 NOK*  (= 49.10 EUR)
    */

    EUR: new Big(4900),
    USD: new Big(5490),
    JPY: new Big(5899),
    AUD: new Big(7900),
    GBP: new Big(4190),
    CAD: new Big(6900),
    SEK: new Big(51900),
    DKK: new Big(36900),
    NOK: new Big(49900)
  }
}, {
  sku: 'custom-map-print-24x36inch',
  name: {
    'en-US': 'Map print 24x36inch',
    'fi-FI': 'Karttajuliste 24x36inch'
  },
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    /*
    69 EUR = 76.35 USD ~ *74.9 USD*  (= 67.69 EUR)
    69 EUR = 8339.22 JPY ~ *8299 JPY*  (= 68.67 EUR)
    69 EUR = 110.79 AUD ~ *109 AUD*  (= 67.88 EUR)
    69 EUR = 59.26 GBP ~ *58.9 GBP*  (= 68.58 EUR)
    69 EUR = 100.46 CAD ~ *99 CAD*  (= 68.00 EUR)
    69 EUR = 738.08 SEK ~ *739 SEK*  (= 69.09 EUR)
    69 EUR = 515.59 DKK ~ *519 DKK*  (= 69.46 EUR)
    69 EUR = 701.22 NOK ~ *699 NOK*  (= 68.78 EUR)
    */

    EUR: new Big(6900),
    USD: new Big(7490),
    JPY: new Big(8299),
    AUD: new Big(10900),
    GBP: new Big(5890),
    CAD: new Big(9900),
    SEK: new Big(73900),
    DKK: new Big(51900),
    NOK: new Big(69900)
  }
}, {
  sku: 'physical-gift-card',
  name: {
    'en-US': 'Premium gift card',
    'fi-FI': 'Premium lahjakortti'
  },
  rules: [{ type: 'MAX_QUANTITY', payload: 1 }],
  live: true,
  shippable: true,
  vatPercentage: new Big(24),
  discountClass: 1,
  grossPrices: {
    /*
    6.9 EUR = 7.64 USD ~ *7.9 USD*  (= 7.14 EUR)
    6.9 EUR = 834.08 JPY ~ *833.9 JPY*  (= 6.90 EUR)
    6.9 EUR = 11.08 AUD ~ *10.9 AUD*  (= 6.79 EUR)
    6.9 EUR = 5.93 GBP ~ *5.9 GBP*  (= 6.87 EUR)
    6.9 EUR = 10.06 CAD ~ *9.9 CAD*  (= 6.79 EUR)
    6.9 EUR = 73.84 SEK ~ *73.9 SEK*  (= 6.91 EUR)
    6.9 EUR = 51.56 DKK ~ *51.9 DKK*  (= 6.95 EUR)
    6.9 EUR = 70.13 NOK ~ *69.9 NOK*  (= 6.88 EUR)
    */

    EUR: new Big(690),
    USD: new Big(790),
    JPY: new Big(829),
    AUD: new Big(1090),
    GBP: new Big(590),
    CAD: new Big(990),
    SEK: new Big(7390),
    DKK: new Big(5190),
    NOK: new Big(6990)
  }
}, {
  sku: 'shipping-express',
  name: {
    'en-US': 'Express shipping',
    'fi-FI': 'Express-kuljetus'
  },
  rules: [{ type: 'MAX_QUANTITY', payload: 1 }],
  live: true,
  shippable: false,
  vatPercentage: new Big(24),
  discountClass: 1,
  grossPrices: {
    EUR: new Big('0'),
    USD: new Big('0'),
    JPY: new Big('0'),
    AUD: new Big('0'),
    GBP: new Big('0'),
    CAD: new Big('0'),
    SEK: new Big('0'),
    DKK: new Big('0'),
    NOK: new Big('0')
  }
}, {
  sku: 'production-high-priority',
  name: {
    'en-US': 'Priority production',
    'fi-FI': 'Priority valmistus'
  },
  rules: [{ type: 'MAX_QUANTITY', payload: 1 }],
  live: true,
  shippable: false,
  vatPercentage: new Big(24),
  discountClass: 1,
  grossPrices: {
    /*
    15 EUR = 16.61 USD ~ *16.9 USD*  (= 15.26 EUR)
    15 EUR = 1813.22 JPY ~ *1812.9 JPY*  (= 15.00 EUR)
    15 EUR = 24.09 AUD ~ *23.9 AUD*  (= 14.88 EUR)
    15 EUR = 12.89 GBP ~ *12.9 GBP*  (= 15.01 EUR)
    15 EUR = 21.86 CAD ~ *21.9 CAD*  (= 15.03 EUR)
    15 EUR = 160.53 SEK ~ *160.9 SEK*  (= 15.03 EUR)
    15 EUR = 112.09 DKK ~ *111.9 DKK*  (= 14.97 EUR)
    15 EUR = 152.47 NOK ~ *151.9 NOK*  (= 14.94 EUR)
    */

    EUR: new Big(1500),
    USD: new Big(1690),
    JPY: new Big(1799),
    AUD: new Big(2390),
    GBP: new Big(1290),
    CAD: new Big(2190),
    SEK: new Big(15900),
    DKK: new Big(10900),
    NOK: new Big(14900)
  }
}, {
  sku: 'gift-card-value',
  name: {
    'en-US': 'Gift card value',
    'fi-FI': 'Lahjakortin arvo'
  },
  discountClass: 1,
  live: true,
  shippable: false,
  rules: [{ type: 'MAX_QUANTITY', payload: 1 }, { type: 'MIN_NET_PRICE', payload: 1000 }],
  vatPercentage: new Big('0'),
  dynamicPrice: true
}, {
  sku: 'test-product-vat-0',
  name: {
    'en-US': 'Test product VAT 0'
  },
  live: false,
  shippable: false,
  vatPercentage: new Big('0'),
  discountClass: 0,
  grossPrices: {
    EUR: new Big(1000),
    USD: new Big(1000)
  }
}, {
  sku: 'test-product-vat-10',
  name: {
    'en-US': 'Test product VAT 10'
  },
  live: false,
  shippable: false,
  vatPercentage: new Big(10),
  discountClass: 0,
  grossPrices: {
    EUR: new Big(1000),
    USD: new Big(1000)
  }
}, {
  sku: 'test-product-vat-14',
  name: {
    'en-US': 'Test product VAT 14'
  },
  live: false,
  shippable: false,
  vatPercentage: new Big(14),
  discountClass: 0,
  grossPrices: {
    EUR: new Big(1000),
    USD: new Big(1000)
  }
}, {
  sku: 'test-product-vat-24',
  name: {
    'en-US': 'Test product VAT 24'
  },
  live: false,
  shippable: false,
  vatPercentage: new Big(24),
  discountClass: 0,
  grossPrices: {
    EUR: new Big(1000),
    USD: new Big(1000)
  }
}, {
  sku: 'test-map-30x40cm-vat-28',
  name: {
    'en-US': 'Test map 30x40cm VAT 28'
  },
  live: false,
  shippable: false,
  vatPercentage: new Big(28),
  discountClass: 0,
  grossPrices: {
    EUR: new Big(3900),
    USD: new Big(4490)
  }
}];

var richenedProducts = _.map(products, function (product) {
  var newProduct = _.cloneDeep(product);

  if (product.grossPrices) {
    newProduct.netPrices = {};
    _.forEach(product.grossPrices, function (grossValue, currency) {
      newProduct.netPrices[currency] = calculateNetValue(grossValue, product.vatPercentage);
    });
  }

  if (product.netPrices) {
    newProduct.grossPrices = {};
    _.forEach(product.netPrices, function (netValue, currency) {
      newProduct.grossPrices[currency] = calculateGrossValue(netValue, product.vatPercentage);
    });
  }

  return newProduct;
});

// Validate that all live and non-dynamic products
// have the same currency definitions
var nonDynamicLive = _.filter(richenedProducts, function (p) {
  return p.live && !p.dynamicPrice;
});
_.forEach(nonDynamicLive, function (product) {
  _.forEach(product.grossPrices, function (value, currency) {
    _.forEach(nonDynamicLive, function (product2) {
      var product2Currencies = _.keys(product2.grossPrices);
      if (!_.includes(product2Currencies, currency)) {
        throw new Error('Inconsistent currency definitions in products ' + product.sku + ' and ' + product2.sku);
      }
    });
  });
});

// We already made sure all products have the same currencies
var supportedCurrencies = _.keys(nonDynamicLive[0].grossPrices);

module.exports = {
  products: richenedProducts,
  supportedCurrencies: supportedCurrencies
};
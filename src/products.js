const Big = require('big.js');
const _ = require('lodash');
const { calculateNetValue, calculateGrossValue } = require('./tax');

const products = [
  {
    sku: 'custom-map-print-30x40cm',
    metadata: {
      size: '30x40cm',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 30x40cm',
      'fi-FI': 'Karttajuliste 30x40cm',
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
      NOK: new Big(39900),
    },
  },
  {
    sku: 'custom-map-print-50x70cm',
    metadata: {
      size: '50x70cm',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 50x70cm',
      'fi-FI': 'Karttajuliste 50x70cm',
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
      NOK: new Big(49900),
    },
  },
  {
    sku: 'custom-map-print-70x100cm',
    metadata: {
      size: '70x100cm',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 70x100cm',
      'fi-FI': 'Karttajuliste 70x100cm',
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
      NOK: new Big(69900),
    },
  },
  {
    sku: 'custom-map-print-12x18inch',
    metadata: {
      size: '12x18inch',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 12x18inch',
      'fi-FI': 'Karttajuliste 12x18inch',
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
      NOK: new Big(42900),
    },
  },
  {
    sku: 'custom-map-print-18x24inch',
    metadata: {
      size: '18x24inch',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 18x24inch',
      'fi-FI': 'Karttajuliste 18x24inch',
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
      NOK: new Big(49900),
    },
  },
  {
    sku: 'custom-map-print-24x36inch',
    metadata: {
      size: '24x36inch',
      material: 'paper',
    },
    name: {
      'en-US': 'Map print 24x36inch',
      'fi-FI': 'Karttajuliste 24x36inch',
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
      NOK: new Big(69900),
    },
  },
  {
    sku: 'custom-map-plywood-30x40cm',
    metadata: {
      size: '30x40cm',
      material: 'plywood',
    },
    name: {
      'en-US': '6mm plywood map 30x40cm',
      'fi-FI': '6mm vanerikartta 30x40cm',
    },
    live: true,
    shippable: true,
    vatPercentage: new Big(24),
    discountClass: 0,
    grossPrices: {
      /*
      59 EUR = 65.31 USD ~ *64.9 USD*  (= 58.63 EUR)
      59 EUR = 7094.94 JPY ~ *7099 JPY*  (= 59.03 EUR)
      59 EUR = 95.61 AUD ~ *94.9 AUD*  (= 58.56 EUR)
      59 EUR = 49.70 GBP ~ *49.9 GBP*  (= 59.23 EUR)
      59 EUR = 86.40 CAD ~ *84.9 CAD*  (= 57.98 EUR)
      59 EUR = 623.16 SEK ~ *619 SEK*  (= 58.61 EUR)
      59 EUR = 440.89 DKK ~ *439 DKK*  (= 58.75 EUR)
      59 EUR = 597.53 NOK ~ *599 NOK*  (= 59.15 EUR)
      */

      EUR: new Big(5900),
      USD: new Big(6490),
      JPY: new Big(7099),
      AUD: new Big(9490),
      GBP: new Big(4990),
      CAD: new Big(8490),
      SEK: new Big(61900),
      DKK: new Big(43900),
      NOK: new Big(59900),
    },
  },
  {
    sku: 'custom-map-plywood-50x70cm',
    metadata: {
      size: '50x70cm',
      material: 'plywood',
    },
    name: {
      'en-US': '6mm plywood map 50x70cm',
      'fi-FI': '6mm vanerikartta 50x70cm',
    },
    live: true,
    shippable: true,
    vatPercentage: new Big(24),
    discountClass: 0,
    grossPrices: {
      /*
      119 EUR = 131.74 USD ~ *129 USD*  (= 116.53 EUR)
      119 EUR = 14310.14 JPY ~ *14299 JPY*  (= 118.91 EUR)
      119 EUR = 192.85 AUD ~ *194.9 AUD*  (= 120.27 EUR)
      119 EUR = 100.25 GBP ~ *99.9 GBP*  (= 118.58 EUR)
      119 EUR = 174.26 CAD ~ *174.9 CAD*  (= 119.44 EUR)
      119 EUR = 1256.87 SEK ~ *1259 SEK*  (= 119.20 EUR)
      119 EUR = 889.25 DKK ~ *889 DKK*  (= 118.97 EUR)
      119 EUR = 1205.19 NOK ~ *1209 NOK*  (= 119.38 EUR)
      */

      EUR: new Big(11900),
      USD: new Big(12900),
      JPY: new Big(14299),
      AUD: new Big(19490),
      GBP: new Big(9990),
      CAD: new Big(17490),
      SEK: new Big(125900),
      DKK: new Big(88900),
      NOK: new Big(120900),
    },
  },
  {
    sku: 'custom-map-plywood-12x18inch',
    metadata: {
      size: '12x18inch',
      material: 'plywood',
    },
    name: {
      'en-US': '6mm plywood map 12x18inch',
      'fi-FI': '6mm vanerikartta 12x18inch',
    },
    live: true,
    shippable: true,
    vatPercentage: new Big(24),
    discountClass: 0,
    grossPrices: {
      /*
      69 EUR = 76.48 USD ~ *74.9 USD*  (= 67.57 EUR)
      69 EUR = 8315.41 JPY ~ *8299 JPY*  (= 68.86 EUR)
      69 EUR = 112.13 AUD ~ *109 AUD*  (= 67.07 EUR)
      69 EUR = 58.31 GBP ~ *57.9 GBP*  (= 68.51 EUR)
      69 EUR = 101.24 CAD ~ *99 CAD*  (= 67.47 EUR)
      69 EUR = 726.27 SEK ~ *729 SEK*  (= 69.26 EUR)
      69 EUR = 515.64 DKK ~ *519 DKK*  (= 69.45 EUR)
      69 EUR = 701.60 NOK ~ *699 NOK*  (= 68.74 EUR)
      */

      EUR: new Big(6900),
      USD: new Big(7490),
      JPY: new Big(8299),
      AUD: new Big(10900),
      GBP: new Big(5790),
      CAD: new Big(9900),
      SEK: new Big(72900),
      DKK: new Big(51900),
      NOK: new Big(69900),
    },
  },
  {
    sku: 'custom-map-plywood-18x24inch',
    metadata: {
      size: '18x24inch',
      material: 'plywood',
    },
    name: {
      'en-US': 'Plywood map 18x24inch (0.24inch thick)',
      'fi-FI': '6mm vanerikartta 18x24inch',
    },
    live: true,
    shippable: true,
    vatPercentage: new Big(24),
    discountClass: 0,
    grossPrices: {
      /*
      109 EUR = 120.82 USD ~ *119 USD*  (= 107.36 EUR)
      109 EUR = 13135.94 JPY ~ *13099 JPY*  (= 108.69 EUR)
      109 EUR = 177.14 AUD ~ *174.9 AUD*  (= 107.62 EUR)
      109 EUR = 92.12 GBP ~ *91.9 GBP*  (= 108.74 EUR)
      109 EUR = 159.93 CAD ~ *159 CAD*  (= 108.37 EUR)
      109 EUR = 1147.30 SEK ~ *1149 SEK*  (= 109.16 EUR)
      109 EUR = 814.56 DKK ~ *809 DKK*  (= 108.26 EUR)
      109 EUR = 1108.32 NOK ~ *1109 NOK*  (= 109.07 EUR)
      */

      EUR: new Big(10900),
      USD: new Big(11900),
      JPY: new Big(13099),
      AUD: new Big(17490),
      GBP: new Big(9190),
      CAD: new Big(15900),
      SEK: new Big(114900),
      DKK: new Big(80900),
      NOK: new Big(110900),
    },
  },
  {
    sku: 'physical-gift-card',
    name: {
      'en-US': 'Premium gift card',
      'fi-FI': 'Premium lahjakortti',
    },
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
      NOK: new Big(6990),
    },
  },

  {
    sku: 'shipping-express',
    name: {
      'en-US': 'Express shipping',
      'fi-FI': 'Express-kuljetus',
    },
    rules: [
      { type: 'MAX_QUANTITY', payload: 1 },
    ],
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
      NOK: new Big('0'),
    },
  },

  {
    sku: 'production-high-priority',
    name: {
      'en-US': 'Priority production',
      'fi-FI': 'Priority valmistus',
    },
    rules: [
      { type: 'MAX_QUANTITY', payload: 1 },
    ],
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
      NOK: new Big(14900),
    },
  },

  {
    sku: 'gift-card-value',
    name: {
      'en-US': 'Gift card value',
      'fi-FI': 'Lahjakortin arvo',
    },
    discountClass: 1,
    live: true,
    shippable: false,
    rules: [
      { type: 'MIN_NET_PRICE', payload: 1000 },
    ],
    vatPercentage: new Big('0'),
    dynamicPrice: true,
  },

  {
    sku: 'test-product-vat-0',
    name: {
      'en-US': 'Test product VAT 0',
    },
    live: false,
    shippable: false,
    vatPercentage: new Big('0'),
    discountClass: 0,
    grossPrices: {
      EUR: new Big(1000),
      USD: new Big(1000),
    },
  },
  {
    sku: 'test-product-vat-10',
    name: {
      'en-US': 'Test product VAT 10',
    },
    live: false,
    shippable: false,
    vatPercentage: new Big(10),
    discountClass: 0,
    grossPrices: {
      EUR: new Big(1000),
      USD: new Big(1000),
    },
  },
  {
    sku: 'test-product-vat-14',
    name: {
      'en-US': 'Test product VAT 14',
    },
    live: false,
    shippable: false,
    vatPercentage: new Big(14),
    discountClass: 0,
    grossPrices: {
      EUR: new Big(1000),
      USD: new Big(1000),
    },
  },
  {
    sku: 'test-product-vat-24',
    name: {
      'en-US': 'Test product VAT 24',
    },
    live: false,
    shippable: false,
    vatPercentage: new Big(24),
    discountClass: 0,
    grossPrices: {
      EUR: new Big(1000),
      USD: new Big(1000),
    },
  },
  {
    sku: 'test-map-30x40cm-vat-28',
    name: {
      'en-US': 'Test map 30x40cm VAT 28',
    },
    live: false,
    shippable: false,
    vatPercentage: new Big(28),
    discountClass: 0,
    grossPrices: {
      EUR: new Big(3900),
      USD: new Big(4490),
    },
  },
];

const richenedProducts = _.map(products, (product) => {
  const newProduct = _.cloneDeep(product);

  if (product.grossPrices) {
    newProduct.netPrices = {};
    _.forEach(product.grossPrices, (grossValue, currency) => {
      newProduct.netPrices[currency] = calculateNetValue(grossValue, product.vatPercentage);
    });
  }

  if (product.netPrices) {
    newProduct.grossPrices = {};
    _.forEach(product.netPrices, (netValue, currency) => {
      newProduct.grossPrices[currency] = calculateGrossValue(netValue, product.vatPercentage);
    });
  }

  return newProduct;
});

// Validate that all live and non-dynamic products
// have the same currency definitions
const nonDynamicLive = _.filter(richenedProducts, (p) => {
  return p.live && !p.dynamicPrice;
});
_.forEach(nonDynamicLive, (product) => {
  _.forEach(product.grossPrices, (value, currency) => {
    _.forEach(nonDynamicLive, (product2) => {
      const product2Currencies = _.keys(product2.grossPrices);
      if (!_.includes(product2Currencies, currency)) {
        throw new Error(`Inconsistent currency definitions in products ${product.sku} and ${product2.sku}`);
      }
    });
  });
});

// We already made sure all products have the same currencies
const supportedCurrencies = _.keys(nonDynamicLive[0].grossPrices);

module.exports = {
  products: richenedProducts,
  supportedCurrencies,
};

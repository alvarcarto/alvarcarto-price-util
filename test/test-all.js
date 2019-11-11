const assert = require('assert');
const priceUtil = require('../src/index');

describe('basic cases', () => {
  it('one 30x40cm in cart', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'FI' });
    assert.deepEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '39,00 €',
      net: {
        value: 3145,
        humanValue: '31.45',
        label: '31,45 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 755,
        humanValue: '7.55',
        label: '7,55 €',
      }],
    });
  });

  it('unit price for 3x 30x40cm in cart', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 3,
      },
    ];

    const price = priceUtil.calculateItemPrice(cart[0], { onlyUnitPrice: true });
    assert.deepEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '39,00 €',
      net: {
        value: 3145,
        humanValue: '31.45',
        label: '31,45 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 755,
        humanValue: '7.55',
        label: '7,55 €',
      }],
    });
  });

  it('30x40cm, 50x70cm and 70x100cm in cart', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
      {
        id: 'custom-map-print-50x70cm',
        quantity: 2,
      },
      {
        id: 'custom-map-print-70x100cm',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 20600,
      humanValue: '206.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '206,00 €',
      net: {
        value: 16613,
        humanValue: '166.13',
        label: '166,13 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 3987,
        humanValue: '39.87',
        label: '39,87 €',
      }],
    });
  });

  it('12x18inch, 18x24inch and 24x36inch in cart', () => {
    const cart = [
      {
        id: 'custom-map-print-12x18inch',
        quantity: 1,
      },
      {
        id: 'custom-map-print-18x24inch',
        quantity: 2,
      },
      {
        id: 'custom-map-print-24x36inch',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 20890,
      humanValue: '208.90',
      currency: 'EUR',
      label: '208,90 €',
      zeroDecimalCurrency: false,
      net: {
        value: 16847,
        humanValue: '168.47',
        label: '168,47 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 4043,
        humanValue: '40.43',
        label: '40,43 €',
      }],
    });
  });

  it('30x40cm, 50x70cm, high class production, and express shipping in cart', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
      {
        quantity: 2,
        id: 'custom-map-print-50x70cm',
      },
      {
        id: 'production-high-priority',
        quantity: 1,
      },
      {
        id: 'shipping-express',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 15200,
      humanValue: '152.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '152,00 €',
      net: {
        value: 12258,
        humanValue: '122.58',
        label: '122,58 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 2942,
        humanValue: '29.42',
        label: '29,42 €',
      }],
    });
  });

  it('quantity above 1 for productionClass should not be accepted', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
      {
        id: 'custom-map-print-50x70cm',
        quantity: 2,
      },
      {
        id: 'production-high-priority',
        quantity: 2,
      },
      {
        id: 'shipping-express',
        quantity: 1,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Quantity for production-high-priority must not be above 1./
    );
  });

  it('quantity above 1 for shippingClass should not be accepted', () => {
    const cart = [
      {
        id: 'shipping-express',
        quantity: 2,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Quantity for shipping-express must not be above 1./
    );
  });

  it('shipping should be free', () => {
    const cart = [
      {
        id: 'shipping-express',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 0,
      humanValue: '0.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '0,00 €',
      net: {
        value: 0,
        humanValue: '0.00',
        label: '0,00 €',
      },
      taxes: [{
        taxPercentage: 24,
        value: 0,
        humanValue: '0.00',
        label: '0,00 €',
      }],
    });
  });

  it('gift card in cart', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: 4900,
        },
        quantity: 1,
      },
      {
        id: 'physical-gift-card',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { currency: 'EUR' });
    assert.deepEqual(price, {
      value: 5590,
      humanValue: '55.90',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '55,90 €',
      net: {
        humanValue: 54.56,
        label: '54,56 €',
        value: 5456,
      },
      taxes: [
        {
          humanValue: '0.00',
          label: '0,00 €',
          taxPercentage: 0,
          value: 0,
        },
        {
          humanValue: '1.34',
          label: '1,34 €',
          taxPercentage: 24,
          value: 134,
        },
      ],
    });
  });

  it('negative gift card value should not be accepted', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: -4900,
        },
        quantity: 1,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Item gift-card-value net price must be at least 1000/
    );
  });

  it('gift card value missing metadata should throw', () => {
    const cart = [
      {
        id: 'gift-card-value',
        quantity: 1,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /No metadata object found for dynamic priced item gift-card-value/
    );
  });

  it('gift card value missing metadata.netValue should throw', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValuuuu: 1200
        },
        quantity: 1,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /No metadata.netValue found for dynamic priced item gift-card-value/
    );
  });

  it('zero gift card value should not be accepted', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: 0,
        },
        quantity: 1,
      }
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Item gift-card-value net price must be at least 1000/
    );
  });

  it('too low gift card value should not be accepted', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: 999
        },
        quantity: 1,
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Item gift-card-value net price must be at least 1000/
    );
  });

  it('Unknown cart item types should not be accepted', () => {
    const cart = [
      {
        id: 'no-such-product',
        quantity: 1,
      }
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /No such product with id: no-such-product/
    );
  });

  it('item price calculation for gift card value should work', () => {
    const price = priceUtil.calculateItemPrice({
      id: 'gift-card-value',
      quantity: 1,
      metadata: {
        netValue: 4900,
      },
    });

    assert.deepEqual(price, {
      value: 4900,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '49,00 €',
      humanValue: '49.00',
      net: {
        value: 4900,
        label: '49,00 €',
        humanValue: '49.00',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 0,
        },
      ],
    });
  });

  it('item price calculation for physical gift card should work', () => {
    const price = priceUtil.calculateItemPrice({
      id: 'physical-gift-card',
      quantity: 1,
    });
    console.log(JSON.stringify(price, null, 2))
    assert.deepEqual(price, {
      value: 690,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '6,90 €',
      humanValue: '6.90',
      net: {
        value: 556,
        label: '5,56 €',
        humanValue: '5.56',
      },
      taxes: [
        {
          value: 134,
          label: '1,34 €',
          humanValue: '1.34',
          taxPercentage: 24,
        },
      ],
    });
  });

  it('quantity is required for gift card', () => {
    assert.throws(
      () => priceUtil.calculateItemPrice({ id: 'gift-card-value', value: 4900 }),
      /Item quantity should be an integer/
    );
  });

  // This is not something we're yet supporting in the UI, but price
  // calculation works
  it('multiple gift cards in cart', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: 1000,
        },
        quantity: 1,
      },
      {
        id: 'physical-gift-card',
        quantity: 3,
      },
    ];
    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Item physical-gift-card max allowed quantity is 1 but found 3/
    );
  });

  it('invalid quantity should throw an error', () => {
    const cart = [
      {
        quantity: 'a',
        id: 'custom-map-print-30x40cm',
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Item quantity should be an integer/
    );
  });

  it('simple static discount promotion', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
      {
        quantity: 2,
        id: 'custom-map-print-50x70cm',
      },
      {
        quantity: 1,
        id: 'custom-map-print-70x100cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 1020,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 19580,
      humanValue: '195.80',
      currency: 'EUR',
      label: '195.80 €',
      discount: {
        value: 1020,
        humanValue: '10.20',
        currency: 'EUR',
        label: '10.20 €',
      },
    });
  });

  it('percentage discount promotion with rounding error possibility', () => {
    const cart = [
      {
        // Price: 8 * 39€ = 312€
        quantity: 8,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'PERCENTAGE',
      // We wouldn't do this kind of promotion in practice
      // but it reveals rounding errors
      value: 0.333,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 20810,
      humanValue: '208.10',
      currency: 'EUR',
      label: '208.10 €',
      discount: {
        value: 10390,
        humanValue: '103.90',
        currency: 'EUR',
        label: '103.90 €',
      },
    });
  });

  it('percentage discount which doubles the price', () => {
    const cart = [
      {
        // Price: 3 * 39€ = 117€
        quantity: 3,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'PERCENTAGE',
      value: -1.0,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'FI', promotion });
    assert.deepEqual(price, {
      value: 23400,
      humanValue: '234.00',
      currency: 'EUR',
      label: '234.00 €',
      net: {
        currency: 'EUR',
        humanValue: '188.71',
        label: '188.71 €',
        value: 18871,
      },
      tax: {
        taxPercentage: 24,
        currency: 'EUR',
        humanValue: '45.29',
        label: '45.29 €',
        value: 4529,
      },
      discount: {
        // Negative discount means you pay more
        value: -11700,
        humanValue: '-117.00',
        currency: 'EUR',
        label: '-117.00 €',
      },
    });
  });

  it('percentage discount which is bigger than the price should cause zero price', () => {
    const cart = [
      {
        // Price: 39€
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'PERCENTAGE',
      value: 1.2,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'FI', promotion });
    assert.deepEqual(price, {
      value: 0,
      humanValue: '0.00',
      currency: 'EUR',
      label: '0.00 €',
      net: {
        value: 0,
        humanValue: '0.00',
        currency: 'EUR',
        label: '0.00 €',
      },
      tax: {
        taxPercentage: 24,
        value: 0,
        humanValue: '0.00',
        currency: 'EUR',
        label: '0.00 €',
      },
      discount: {
        value: 3900,
        humanValue: '39.00',
        currency: 'EUR',
        label: '39.00 €',
      },
    });
  });

  it('fixed discount which is bigger than the price should cause zero price', () => {
    const cart = [
      {
        // Price: 39€
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      value: 5000,
      currency: 'EUR',
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 0,
      humanValue: '0.00',
      currency: 'EUR',
      label: '0.00 €',
      discount: {
        value: 3900,
        humanValue: '39.00',
        currency: 'EUR',
        label: '39.00 €',
      },
    });
  });

  it('promotion should not affect shipping or production class prices', () => {
    const cart = [
      {
        id: 'production-high-priority',
        quantity: 1,
      },
      {
        id: 'shipping-express',
        quantity: 1,
      },
      {
        quantity: 1,
        id: 'custom-map-print-70x100cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 10000,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 1500,
      humanValue: '15.00',
      currency: 'EUR',
      label: '15.00 €',
      discount: {
        value: 6900,
        humanValue: '69.00',
        currency: 'EUR',
        label: '69.00 €',
      },
    });
  });

  it('PLATINUM promotion allows discount for any product', () => {
    const cart = [
      {
        id: 'production-high-priority',
        quantity: 1,
      },
      {
        id: 'shipping-express',
        quantity: 1,
      },
      {
        quantity: 1,
        id: 'custom-map-print-70x100cm',
      },
      {
        id: 'gift-card-value',
        value: 6900,
        quantity: 1,
      },
      {
        id: 'physical-gift-card',
        quantity: 1,
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 100000,
      promotionCode: 'PLATINUM',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 0,
      humanValue: '0.00',
      currency: 'EUR',
      label: '0.00 €',
      discount: {
        value: 15990,
        humanValue: '159.90',
        currency: 'EUR',
        label: '159.90 €',
      },
    });
  });

  it('promotion should not affect shipping or production class prices', () => {
    const cart = [
      {
        id: 'gift-card-value',
        value: 6900,
        quantity: 1,
      },
      {
        id: 'physical-gift-card',
        quantity: 1,
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 10000,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepEqual(price, {
      value: 7590,
      humanValue: '75.90',
      currency: 'EUR',
      label: '75.90 €',
      discount: {
        value: 0,
        humanValue: '0.00',
        currency: 'EUR',
        label: '0.00 €',
      },
    });
  });

  it('inconsistent currencies between cart and promotion should throw an error', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'USD',
      value: 1000,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    assert.throws(
      () => priceUtil.calculateCartPrice(cart, { promotion }),
      /Promotion currency mismatches the total value/
    );
  });

  it('unknown promotion type should throw an error', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'UNKNOWNTYPE',
      currency: 'EUR',
      value: 1000,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    assert.throws(
      () => priceUtil.calculateCartPrice(cart, { promotion }),
      /Invalid promotion type/
    );
  });

  it('expired promotion should throw an error', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 500,
      promotionCode: 'TEST',
      hasExpired: true,
    };

    assert.throws(
      () => priceUtil.calculateCartPrice(cart, { promotion }),
      /Promotion \(TEST\) has expired/
    );
  });

  it('expired promotion should not throw an error when ignorePromotionExpiry: true', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 500,
      promotionCode: 'TEST',
      hasExpired: true,
    };

    const price = priceUtil.calculateCartPrice(cart, {
      promotion,
      ignorePromotionExpiry: true,
    });
    assert.deepEqual(price, {
      value: 3400,
      humanValue: '34.00',
      currency: 'EUR',
      label: '34.00 €',
      discount: {
        value: 500,
        humanValue: '5.00',
        currency: 'EUR',
        label: '5.00 €',
      },
    });
  });

  it('case where net + tax are both ".5 cents"', () => {
    const cart = [
      {
        quantity: 20,
        id: 'custom-map-print-30x40cm',
        // Other fields are not used
      },
    ];

    // This is a somewhat theoretical example. There are a lot of gross prices
    // where this same "bug" occurs but with Finland's current VAT %, this
    // never happens.
    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 78000,
      humanValue: '780.00',
      currency: 'EUR',
      label: '780.00 €',
      net: {
        // The exact sum is 60937.5 cents
        // but net value is rounded down, to make net + tax equal gross price
        value: 60937,
        humanValue: '609.37',
        currency: 'EUR',
        label: '609.37 €',
      },
      tax: {
        taxPercentage: 28,
        // The exact sum is 17062.5 cents
        // but the tax value is rounded normally (up)
        value: 17063,
        humanValue: '170.63',
        currency: 'EUR',
        label: '170.63 €',
      },
    });
  });

  it('expired promotion should throw an error', () => {
    const cart = [
      {
        type: 'unexisting',
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Invalid item type: unexisting/
    );
  });
});

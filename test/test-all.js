const assert = require('assert');
const _ = require('lodash');
const priceUtil = require('../src/index');

describe('cases', () => {
  it('one 30x40cm in cart', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'FI' });
    assert.deepStrictEqual(price, {
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

  it('one 30x40cm in cart shipped outside EU', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'US' });
    assert.deepStrictEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '39,00 €',
      net: {
        value: 3900,
        humanValue: '39.00',
        label: '39,00 €',
      },
      taxes: [{
        taxPercentage: 0,
        value: 0,
        humanValue: '0.00',
        label: '0,00 €',
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
    assert.deepStrictEqual(price, {
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
    assert.deepStrictEqual(price, {
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
    assert.deepStrictEqual(price, {
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
    assert.deepStrictEqual(price, {
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
      /Item production-high-priority max allowed quantity is 1 but found 2/
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
      /Item shipping-express max allowed quantity is 1 but found 2/
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
    assert.deepStrictEqual(price, {
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
    assert.deepStrictEqual(price, {
      value: 5590,
      humanValue: '55.90',
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '55,90 €',
      net: {
        humanValue: '54.56',
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
          netValuuuu: 1200,
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
      },
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
          netValue: 999,
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
      },
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

    assert.deepStrictEqual(price, {
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

    assert.deepStrictEqual(price, {
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

    assert.deepStrictEqual(price, {
      value: 19580,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '195,80 €',
      humanValue: '195.80',
      net: {
        value: 15790,
        label: '157,90 €',
        humanValue: '157.90',
      },
      taxes: [
        {
          value: 3790,
          label: '37,90 €',
          humanValue: '37.90',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 1020,
        label: '10,20 €',
        humanValue: '10.20',
      },
    });
  });

  it('discount should be applied to the cart items in order', () => {
    const cart = [
      // 10€ promotion should be used for this VAT 0 product
      {
        quantity: 1,
        id: 'test-product-vat-0',
      },
      // 39 € promotion should be used for this VAT 24 print
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
      // 0.2€ promotion should be used for this VAT 10 product
      {
        quantity: 1,
        id: 'test-product-vat-10',
      },
      {
        quantity: 1,
        id: 'test-product-vat-24',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 4920,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });

    assert.deepStrictEqual(price, {
      value: 1980,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '19,80 €',
      humanValue: '19.80',
      net: {
        value: 1697,
        label: '16,97 €',
        humanValue: '16.97',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 0,
        },
        {
          value: 89,
          label: '0,89 €',
          humanValue: '0.89',
          taxPercentage: 10,
        },
        {
          value: 194,
          label: '1,94 €',
          humanValue: '1.94',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 4920,
        label: '49,20 €',
        humanValue: '49.20',
      },
    });
  });

  it('percentage discount promotion with rounding error possibility', () => {
    // Price: 8 * 39€ = 312€
    const cart = _.times(8, () => ({
      quantity: 1,
      id: 'custom-map-print-30x40cm',
    }));

    const promotion = {
      type: 'PERCENTAGE',
      // We wouldn't do this kind of promotion in practice
      // but it reveals rounding errors.
      value: 0.333,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    // If the exact numbers are used to calculate net price,
    // the end result would be that net + tax != gross
    // discount: 8 * 39 * 0.333 = 103.896
    // left to pay: 8 * 39 - 103.896 = 208.104
    // net: 208.14 / 1.24 = 167.8258064... ~ 167.83€
    // tax: 208.14 - 208.14 / 1.24 = 40.278193548... ~ 40.28€
    //
    // 167.83 + 40.29 = 208.12, which is 1 cent more than the rounded gross price
    //
    // The way we fix this is by rounding the gross price first, then calculating
    // rounded taxes, and proceed to calculating what's left = net sum
    const price = priceUtil.calculateCartPrice(cart, { promotion });
    assert.deepStrictEqual(price, {
      value: 20810,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '208,10 €',
      humanValue: '208.10',
      net: {
        value: 16782,
        label: '167,82 €',
        humanValue: '167.82',
      },
      taxes: [
        {
          value: 4028,
          label: '40,28 €',
          humanValue: '40.28',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 10390,
        label: '103,90 €',
        humanValue: '103.90',
      },
    });
  });

  it('percentage discount which doubles the price', () => {
    const cart = [
      {
        // Price: 3 * $44.9€ = $134.70
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

    const price = priceUtil.calculateCartPrice(cart, { currency: 'USD', promotion });

    assert.deepStrictEqual(price, {
      value: 26940,
      currency: 'USD',
      zeroDecimalCurrency: false,
      label: '$269.40',
      humanValue: '269.40',
      net: {
        value: 21726,
        label: '$217.26',
        humanValue: '217.26',
      },
      taxes: [
        {
          value: 5214,
          label: '$52.14',
          humanValue: '52.14',
          taxPercentage: 24,
        },
      ],
      discount: {
        // Negative discount means you pay more
        value: -13470,
        label: '-$134.70',
        humanValue: '-134.70',
      },
    });
  });

  it('percentage discount which is bigger than the price should cause zero price', () => {
    const cart = [
      {
        // Price: 39€
        quantity: 2,
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

    assert.deepStrictEqual(price, {
      value: 0,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '0,00 €',
      humanValue: '0.00',
      net: {
        value: 0,
        label: '0,00 €',
        humanValue: '0.00',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 7800,
        label: '78,00 €',
        humanValue: '78.00',
      },
    });
  });

  it('fixed discount which is bigger than the price should cause zero price', () => {
    const cart = [
      {
        // Price: 39€
        quantity: 2,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      value: 10000,
      currency: 'EUR',
      promotionCode: 'TEST',
      hasExpired: false,
    };

    const price = priceUtil.calculateCartPrice(cart, { promotion });

    assert.deepStrictEqual(price, {
      value: 0,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '0,00 €',
      humanValue: '0.00',
      net: {
        value: 0,
        label: '0,00 €',
        humanValue: '0.00',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 7800,
        label: '78,00 €',
        humanValue: '78.00',
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

    assert.deepStrictEqual(price, {
      value: 1500,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '15,00 €',
      humanValue: '15.00',
      net: {
        value: 1210,
        label: '12,10 €',
        humanValue: '12.10',
      },
      taxes: [
        {
          value: 290,
          label: '2,90 €',
          humanValue: '2.90',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 6900,
        label: '69,00 €',
        humanValue: '69.00',
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
        metadata: {
          netValue: 6900,
        },
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

    assert.deepStrictEqual(price, {
      value: 0,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '0,00 €',
      humanValue: '0.00',
      net: {
        value: 0,
        label: '0,00 €',
        humanValue: '0.00',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 0,
        },
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 15990,
        label: '159,90 €',
        humanValue: '159.90',
      },
    });
  });

  it('regular promotions should not allow discount for gift cards', () => {
    const cart = [
      {
        id: 'gift-card-value',
        metadata: {
          netValue: 6900,
        },
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
    assert.deepStrictEqual(price, {
      value: 7590,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '75,90 €',
      humanValue: '75.90',
      net: {
        value: 7456,
        label: '74,56 €',
        humanValue: '74.56',
      },
      taxes: [
        {
          value: 0,
          label: '0,00 €',
          humanValue: '0.00',
          taxPercentage: 0,
        },
        {
          value: 134,
          label: '1,34 €',
          humanValue: '1.34',
          taxPercentage: 24,
        },
      ],
    });
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
    assert.deepStrictEqual(price, {
      value: 3400,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '34,00 €',
      humanValue: '34.00',
      net: {
        value: 2742,
        label: '27,42 €',
        humanValue: '27.42',
      },
      taxes: [
        {
          value: 658,
          label: '6,58 €',
          humanValue: '6.58',
          taxPercentage: 24,
        },
      ],
      discount: {
        value: 500,
        label: '5,00 €',
        humanValue: '5.00',
      },
    });
  });

  it('case where net + tax are both ".5 cents"', () => {
    // In this case, if we didn't use a rounding method to calculate the net sum,
    // net + tax would be 2 cents more than the rounded gross price.
    // This case happens when precise net sum is x.5 cents, and tax sum is x.5 cents as well
    const cart = [
      {
        quantity: 20,
        id: 'test-map-30x40cm-vat-28',
        // Other fields are not used
      },
    ];

    // This is a somewhat theoretical example. There are a lot of gross prices
    // where this same "bug" occurs but with Finland's current VAT %, this
    // never happens.
    const price = priceUtil.calculateCartPrice(cart);

    assert.deepStrictEqual(price, {
      value: 78000,
      currency: 'EUR',
      zeroDecimalCurrency: false,
      label: '780,00 €',
      humanValue: '780.00',
      // The exact sum is 60937.5 cents
      // but net value is rounded down, to make net + tax equal gross price
      net: {
        value: 60937,
        label: '609,37 €',
        humanValue: '609.37',
      },
      taxes: [
        // The exact sum is 17062.5 cents
        // but the tax value is rounded normally (up)
        {
          value: 17063,
          label: '170,63 €',
          humanValue: '170.63',
          taxPercentage: 28,
        },
      ],
    });
  });
});

describe('currencies', () => {
  it('one 12x18inch with USD', () => {
    const cart = [
      {
        id: 'custom-map-print-12x18inch',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'US', currency: 'USD' });
    assert.deepStrictEqual(price, {
      value: 4490,
      humanValue: '44.90',
      currency: 'USD',
      zeroDecimalCurrency: false,
      label: '$44.90',
      net: {
        value: 4490,
        humanValue: '44.90',
        label: '$44.90',
      },
      taxes: [{
        taxPercentage: 0,
        value: 0,
        humanValue: '0.00',
        label: '$0.00',
      }],
    });
  });

  it('purchase with JPY', () => {
    const cart = [
      {
        id: 'custom-map-print-30x40cm',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'JP', currency: 'JPY' });
    assert.deepStrictEqual(price, {
      value: 4699,
      humanValue: '4699',
      currency: 'JPY',
      zeroDecimalCurrency: true,
      label: '¥4,699',
      net: {
        value: 4699,
        humanValue: '4699',
        label: '¥4,699',
      },
      taxes: [{
        taxPercentage: 0,
        value: 0,
        humanValue: '0',
        label: '¥0',
      }],
    });
  });

  it('inconsistent currency between promotion and opts.currency', () => {
    const cart = [
      {
        quantity: 1,
        id: 'custom-map-print-30x40cm',
      },
    ];

    const promotion = {
      type: 'FIXED',
      currency: 'EUR',
      value: 1000,
      promotionCode: 'TEST',
      hasExpired: false,
    };

    assert.throws(
      () => priceUtil.calculateCartPrice(cart, { promotion, currency: 'USD' }),
      /Promotion currency \(EUR\) mismatches the requested currency \(USD\)/
    );
  });

  it('gift card with GBP currency', () => {
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

    const price = priceUtil.calculateCartPrice(cart, { currency: 'GBP' });
    assert.deepStrictEqual(price, {
      value: 5490,
      humanValue: '54.90',
      currency: 'GBP',
      zeroDecimalCurrency: false,
      label: '£54.90',
      net: {
        humanValue: '53.76',
        label: '£53.76',
        value: 5376,
      },
      taxes: [
        {
          humanValue: '0.00',
          label: '£0.00',
          taxPercentage: 0,
          value: 0,
        },
        {
          humanValue: '1.14',
          label: '£1.14',
          taxPercentage: 24,
          value: 114,
        },
      ],
    });
  });

  it('getSupportedCurrencies', () => {
    // At the moment shipToCountry does not affect currencies
    const currencies = priceUtil.getSupportedCurrencies('FI');
    const currencies2 = priceUtil.getSupportedCurrencies('US');
    const currencies3 = priceUtil.getSupportedCurrencies();

    const expectedCurrencies = ['EUR', 'USD', 'JPY', 'AUD', 'GBP', 'CAD', 'SEK', 'DKK', 'NOK'];

    assert.deepStrictEqual(expectedCurrencies, currencies);
    assert.deepStrictEqual(expectedCurrencies, currencies2);
    assert.deepStrictEqual(expectedCurrencies, currencies3);
  });

  it('isSupportedCurrency', () => {
    // At the moment shipToCountry does not affect currencies
    assert.strictEqual(true, priceUtil.isSupportedCurrency('usd'));
    assert.strictEqual(true, priceUtil.isSupportedCurrency('USD'));

    assert.strictEqual(true, priceUtil.isSupportedCurrency('EUR'));
    assert.strictEqual(true, priceUtil.isSupportedCurrency('eur'));
    assert.strictEqual(false, priceUtil.isSupportedCurrency('EURO'));
  });
});

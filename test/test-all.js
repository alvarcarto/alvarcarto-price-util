const assert = require('assert');
const priceUtil = require('../src/index');

describe('basic cases', () => {
  it('one 30x40cm in cart', () => {
    const cart = [
      {
        quantity: 1,
        size: '30x40cm',
        // Other fields are not used
      },
    ];

    const price = priceUtil.calculateCartPrice(cart, { shipToCountry: 'FI' });
    assert.deepEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      label: '39.00 €',
      net: {
        value: 3145,
        humanValue: '31.45',
        currency: 'EUR',
        label: '31.45 €',
      },
      tax: {
        taxPercentage: 24,
        value: 755,
        humanValue: '7.55',
        currency: 'EUR',
        label: '7.55 €',
      },
    });
  });

  it('unit price for 3x 30x40cm in cart', () => {
    const cart = [
      {
        quantity: 3,
        size: '30x40cm',
      },
    ];

    const price = priceUtil.calculateUnitPrice(cart[0].size);
    assert.deepEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      label: '39.00 €',
    });
  });

  it('30x40cm, 50x70cm and 70x100cm in cart', () => {
    const cart = [
      {
        quantity: 1,
        size: '30x40cm',
      },
      {
        quantity: 2,
        size: '50x70cm',
      },
      {
        quantity: 1,
        size: '70x100cm',
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 20600,
      humanValue: '206.00',
      currency: 'EUR',
      label: '206.00 €',
    });
  });

  it('gift card in cart', () => {
    const cart = [
      {
        type: 'giftCardValue',
        value: 4900,
        quantity: 1,
      },
      {
        type: 'physicalGiftCard',
        quantity: 1,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 5590,
      humanValue: '55.90',
      currency: 'EUR',
      label: '55.90 €',
    });
  });

  it('negative gift card value should not be accepted', () => {
    const cart = [
      {
        type: 'giftCardValue',
        value: -4900,
        quantity: 1,
      }
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Gift card value must be positive:/
    );
  });

  it('zero gift card value should not be accepted', () => {
    const cart = [
      {
        type: 'giftCardValue',
        value: 0,
        quantity: 1,
      }
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Gift card value must be positive:/
    );
  });

  it('Unknown cart item types should not be accepted', () => {
    const cart = [
      {
        type: 'noSuchProduct',
        size: '30x40cm',
        quantity: 1,
      }
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Invalid item type/
    );
  });

  it('item price calculation for gift card value should work', () => {
    const price = priceUtil.calculateItemPrice({
      type: 'giftCardValue',
      quantity: 1,
      value: 4900,
    });
    assert.deepEqual(price, {
      value: 4900,
      humanValue: '49.00',
      currency: 'EUR',
      label: '49.00 €',
    });
  });

  it('item price calculation for physical gift card should work', () => {
    const price = priceUtil.calculateItemPrice({
      type: 'physicalGiftCard',
      quantity: 1,
    });
    assert.deepEqual(price, {
      value: 690,
      humanValue: '6.90',
      currency: 'EUR',
      label: '6.90 €',
    });
  });

  it('quantity is required for gift card', () => {
    assert.throws(
      () => priceUtil.calculateItemPrice({ type: 'giftCardValue', value: 4900 }),
      /Item quantity should be an integer/
    );
  });

  // This is not something we're yet supporting in the UI, but price
  // calculation works
  it('multiple gift cards in cart', () => {
    const cart = [
      {
        type: 'giftCardValue',
        value: 4101,  // This can be any value
        quantity: 2,
      },
      {
        type: 'physicalGiftCard',
        quantity: 3,
      },
    ];

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 10272,
      humanValue: '102.72',
      currency: 'EUR',
      label: '102.72 €',
    });
  });

  it('invalid poster size should throw an error', () => {
    const cart = [
      {
        quantity: 1,
        size: '30x30cm',
      },
    ];

    assert.throws(
      () => priceUtil.calculateCartPrice(cart),
      /Invalid size:/
    );
  });

  it('invalid quantity should throw an error', () => {
    const cart = [
      {
        quantity: 'a',
        size: '30x40cm',
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
        size: '30x40cm',
      },
      {
        quantity: 2,
        size: '50x70cm',
      },
      {
        quantity: 1,
        size: '70x100cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
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

  it('inconsistent currencies between cart and promotion should throw an error', () => {
    const cart = [
      {
        quantity: 1,
        size: '30x40cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
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
        size: '30x40cm',
        // Other fields are not used
      },
    ];

    // This is a somewhat theoretical example. There are a lot of gross prices
    // where this same "bug" occurs but with Finland's current VAT %, this
    // never happens.
    const price = priceUtil.calculateCartPrice(cart, { taxPercentage: 28 });
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
});

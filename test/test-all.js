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

    const price = priceUtil.calculateCartPrice(cart);
    assert.deepEqual(price, {
      value: 3900,
      humanValue: '39.00',
      currency: 'EUR',
      label: '39.00 €',
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
      label: '206.00 €'
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
    }

    const price = priceUtil.calculateCartPrice(cart, promotion);
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

    const price = priceUtil.calculateCartPrice(cart, promotion);
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

    const price = priceUtil.calculateCartPrice(cart, promotion);
    assert.deepEqual(price, {
      value: 23400,
      humanValue: '234.00',
      currency: 'EUR',
      label: '234.00 €',
      discount: {
        // Negative discount means you pay more
        value: -11700,
        humanValue: '-117.00',
        currency: 'EUR',
        label: '-117.00 €',
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
      () => priceUtil.calculateCartPrice(cart, promotion),
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
      () => priceUtil.calculateCartPrice(cart, promotion),
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
      () => priceUtil.calculateCartPrice(cart, promotion),
      /Promotion \(TEST\) has expired/
    );
  });
});

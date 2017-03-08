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
});

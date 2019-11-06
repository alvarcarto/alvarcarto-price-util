const _ = require('lodash');
const request = require('request-promise');
const { STRIPE_ZERO_DECIMAL_CURRENCIES } = require('../src/stripe');

// When trying to find a nicer price, we allow the price at max
// be this much lower than the original
const MAX_ALLOWED_LOSS_IN_PERCENTAGE = 0.05;

async function getRates(newBase = 'EUR') {
  const data = await request({
    url: 'https://openexchangerates.org/api/latest.json',
    json: true,
    simple: true,
    qs: {
      app_id: process.env.OPEN_EXCHANGE_RATES_KEY,
    },
  });

  const newBaseRate = data.rates[newBase];
  const oldBaseRate = data.rates[data.base];
  const ratio = oldBaseRate / newBaseRate;

  const newRates = {};
  _.forEach(data.rates, (rate, currency) => {
    newRates[currency] = rate * ratio;
  });

  return _.extend({}, data, { rates: newRates, base: newBase });
}

function roundToClosest(x, n = 5) {
  return Math.round(x / n) * n;
}

function ceilToClosest(x, n = 5) {
  return Math.ceil(x / n) * n;
}

function calculateNiceLocalPrice(eurPrice, rate, _opts = {}) {
  const opts = _.merge({
    roundMethod: 'ceil',
  }, _opts);

  const roundFunc = opts.roundMethod === 'ceil' ? ceilToClosest : roundToClosest;

  // We are trying to find the same amount of local currency which equals
  // to 5 EUR, and try to find a sensible rounding number based on that.
  const roundToEur = 5;
  const localPrice = eurPrice * rate;
  const localRound = roundToEur * rate;

  if (localRound < 5 || eurPrice < 20) {
    // For example 5 EUR = 4.29 GBP, meaning that we should round
    // only to closest 1
    return roundFunc(localPrice, 1) - 0.1;
  } else if (localRound < 10) {
    // For example 5 EUR = 5.53 USD, meaning that we should round
    // only to closest 5
    const roundedPrice = roundFunc(localPrice, 5);
    if (_.endsWith(roundedPrice.toFixed(0), '5')) {
      return roundedPrice - 0.1;
    }
    return roundedPrice - 1;
  } else if (localRound < 100) {
    // For example 5 EUR = 53.48 SEK, meaning that we should round
    // only to closest 10
    return roundFunc(localPrice, 10) - 1;
  }

  // For example 5 EUR = 604.29 JPY, meaning that we should round
  // only to closest 100
  return roundFunc(localPrice, 100) - 1;
}

function findNiceLocalPrice(eurPrice, rate) {
  const possiblePrice = calculateNiceLocalPrice(eurPrice, rate, {
    roundMethod: 'round',
  });
  const possiblePriceInEur = possiblePrice / rate;
  if (possiblePriceInEur - eurPrice >= -(eurPrice * MAX_ALLOWED_LOSS_IN_PERCENTAGE)) {
    return possiblePrice;
  }

  // Otherwise we need to ceil the price to not lose over the allowed
  return calculateNiceLocalPrice(eurPrice, rate, {
    roundMethod: 'ceil',
  });
}

function priceToStripeUnits(price, currency) {
  if (_.includes(STRIPE_ZERO_DECIMAL_CURRENCIES, currency)) {
    return price;
  }

  return Math.round(price * 100);
}

async function main() {
  if (!process.argv[2]) {
    console.error('Usage: ./generate-prices.js 39');
    console.error('\nwhere 39 stands for 39€ the gross price in Finland');
    process.exit(2);
  }

  const eurPrice = Number(process.argv[2]);
  const newBase = 'EUR';
  const rates = await getRates(newBase);
  const allPrices = { EUR: priceToStripeUnits(eurPrice, 'EUR') };
  _.forEach(['USD', 'JPY', 'AUD', 'GBP', 'CAD', 'SEK', 'DKK', 'NOK'], (currency) => {
    const rate = rates.rates[currency];
    const exactLocalPrice = eurPrice * rate;
    const niceLocalPrice = findNiceLocalPrice(eurPrice, rate, 5);
    console.log(`${eurPrice} ${newBase} = ${exactLocalPrice.toFixed(2)} ${currency} ~ *${niceLocalPrice} ${currency}*  (= ${(niceLocalPrice / rate).toFixed(2)} EUR)`);

    allPrices[currency] = priceToStripeUnits(niceLocalPrice, currency);
  });

  console.log('')
  console.log(JSON.stringify(allPrices, null, 2));
}

main()
  .catch((err) => {
    throw err;
  });

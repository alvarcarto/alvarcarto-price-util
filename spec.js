calculateCartPrice(cart, {
  saleToCountry,
  promotion,
  salesInEu,
  saleDate,
}) ->

{
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
    value: 755,
    humanValue: '7.55',
    currency: 'EUR',
    label: '7.55 €',
  },
  taxBreakdown: [{
    taxPercentage: 24,
    value: 755,
    humanValue: '7.55',
    currency: 'EUR',
    label: '7.55 €',
  }],
}
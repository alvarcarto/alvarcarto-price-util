function getNetValue(grossValue, vatPercentage) {
  const vatFactor = vatPercentage / 100.0;
  const netValue = grossValue / (1.0 + vatFactor);
  return Math.round(netValue);
}

function getVatValue(grossValue, vatPercentage) {
  const vatFactor = vatPercentage / 100.0;
  const netValue = grossValue / (1.0 + vatFactor);
  const vatValue = grossValue - netValue;
  return Math.round(vatValue);  // in cents
}

for (var taxP = 100; taxP > 0; --taxP) {
  for (var gross = 0; gross < 100000; ++gross) {
    const net = getNetValue(gross, taxP);
    const tax = getVatValue(gross, taxP);

    if (net + tax !== gross) {
      console.log('tax%', taxP, 'net', net, 'tax', tax, 'gross', gross);
    }
  }
}


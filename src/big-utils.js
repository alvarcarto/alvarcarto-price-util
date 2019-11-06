function bigMax(...args) {
  let maxFound = args[0];

  for (let i = 1; i < args.length; ++i) {
    const y = args[i];
    if (maxFound.lt(y)) {
      maxFound = y;
    }
  }

  return maxFound;
}

function bigMin(...args) {
  let minFound = args[0];

  for (let i = 1; i < args.length; ++i) {
    const y = args[i];
    if (minFound.gt(y)) {
      minFound = y;
    }
  }

  return minFound;
}

module.exports = {
  bigMax,
  bigMin,
};

"use strict";

function bigMax() {
  var maxFound = arguments.length <= 0 ? undefined : arguments[0];

  for (var i = 1; i < arguments.length; i += 1) {
    var y = arguments.length <= i ? undefined : arguments[i];
    if (maxFound.lt(y)) {
      maxFound = y;
    }
  }

  return maxFound;
}

function bigMin() {
  var minFound = arguments.length <= 0 ? undefined : arguments[0];

  for (var i = 1; i < arguments.length; i += 1) {
    var y = arguments.length <= i ? undefined : arguments[i];
    if (minFound.gt(y)) {
      minFound = y;
    }
  }

  return minFound;
}

module.exports = {
  bigMax: bigMax,
  bigMin: bigMin
};

function customDeepEqual(actual, expected) {
  // if (typeof actual !== typeof expected) {
  //   return false;
  // }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) {
      
      return false;
    }
    for (let i = 0; i < actual.length; i++) {
      if (!customDeepEqual(actual[i], expected[i])) {
        console.error("Assertion failed: ",actual[i], expected[i], "not matching")
        return false;
      }
    }
  } else if (typeof actual === 'object') {
    if(actual === null || expected === null){
      if(actual === expected) return true;
      console.error("Assertion failed: ", actual, expected, "not matching")
      return false;
    }
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) {
      return false;
    }
    for (const key of actualKeys) {
      if (!customDeepEqual(actual[key], expected[key])) {
        console.error("Assertion failed: ",actual[key], expected[key], "not matching")
        return false;
      }
    }
  } else {
    return actual === expected;
  }
  return true;
}

module.exports = {
  customDeepEqual: customDeepEqual
}
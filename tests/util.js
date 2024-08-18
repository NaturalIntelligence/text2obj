
function customDeepEqual(actual, expected) {
  // if (typeof actual !== typeof expected) {
  //   return false;
  // }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) {
      throw new Error("Number of array item mismatch")
    }
    for (let i = 0; i < actual.length; i++) {
      compare(expected,actual,i);
    }
  } else if (typeof actual === 'object') {
    if(actual === null || expected === null){
      if(actual === expected) return true;
      throw new Error("Assertion failed: ", actual, expected, "not matching")
    }
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) {
      throw new Error("Assertion failed: ",actualKeys.length, expectedKeys.length, " properties count is not matching")
    }
    for (const key of actualKeys) {
      compare(expected,actual,key);
    }
  } else {
    return actual === expected;
  }
  return true;
}

function compare(expected,actual,key){
  if(typeof expected[key] === "string" && expected[key].startsWith("Point to step")){
    // match Circular Reference
    const toMatch = circularRefMsg(actual[key]);
    if(expected[key] !== toMatch) {
      throw new Error(`Assertion failed: Circular: Expected is ${expected[key]}. Actual is ${toMatch}`);
    }
  }else{
    if (!customDeepEqual(actual[key], expected[key])) {
      throw new Error("Assertion failed: ",actual[key], expected[key], "not matching")
    }
  }
  return true;
}

function circularRefMsg(step){
  return `Point to step ${step.index}: ${step.type} ${step.msg}`
}
// safely handles circular references
const toSafeString = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? circularRefMsg(value) // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

module.exports = {
  customDeepEqual: customDeepEqual,
  toSafeString: toSafeString
}
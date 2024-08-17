const FlowParser = require("./../src/FlowParser"); 

describe("Flow Parser", function() {
  it("should parse flow with no statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000`;
    const expected = {
          "name": "Sample flow 1",
          "headers": {
              "version": 1,
              "threshold": 5000
          },
          "steps": {
              "entryStep": null,
              "exitStep": null
          }
      }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  it("should parse flow with 1 DO statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        DO Yes`;
    const expected = {
          "name": "Sample flow 1",
          "headers": {
              "version": 1,
              "threshold": 5000
          },
          "steps": {
              "entryStep": {
                "msg": "Yes",
                "nextStep": []
            },
              "exitStep": null
          }
      }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();

  });
  it("should parse flow with different indentation on same level", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF cond
          DO No
        DO Yeah`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": {
              "msg": "cond",
              "nextStep": [
                  {
                      "msg": "No",
                      "nextStep": [
                          {
                              "msg": "Yeah",
                              "nextStep": []
                          }
                      ]
                  },
                  {
                      "msg": "Yeah",
                      "nextStep": []
                  }
              ]
          },
          "exitStep": {
              "msg": "Yeah",
              "nextStep": []
          }
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();

  });
  it("should parse flow with 1 IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF condition
          DO Yes
        `;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": []
                  }
              ]
          },
          "exitStep": null
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  fit("should parse flow with IF ELSE_IF and ELSE statements", function() {
    const flowText = `
FLOW: Sample flow 1
version: 1.0
threshold: 5000
DO A
IF condition 1
  DO C
ELSE_IF condition 2
  DO K
ELSE
  DO D
DO E`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": []
                  }
              ]
          },
          "exitStep": null
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
});


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

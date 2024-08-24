const FlowParser = require("../src/FlowParser"); 
const {customDeepEqual,toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with END", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        DO A
        END`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": {
        "entryStep": {
          "msg": "A",
          "nextStep": [],
          "index": 0,
          "type": "DO"
        },
        "exitStep": ["Point to step 0: DO A"]
      },
      "index": {
        "0": "Point to step 0: DO A"
      }
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  it("should parse flow with IF END", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF A
          END
        DO B`;
    const expected = {
      "entryStep": {
        "msg": "A",
        "nextStep": [
          null,         // means true branch ends here
          {
            "msg": "B",
            "nextStep": [],
            "index": 1,
            "type": "DO"
          }
        ],
        "index": 0,
        "type": "IF"
      },
      "exitStep": ["Point to step 1: DO B"]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });
  it("should parse flow with LOOP END", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP A
          END
        DO D`;
    const expected = {
      "entryStep": {
        "msg": "A",
        "nextStep": [
          null,         // means true branch ends
          {
            "msg": "D",
            "nextStep": [],
            "index": 1,
            "type": "DO"
          }
        ],
        "index": 0,
        "type": "LOOP"
      },
      "exitStep": ["Point to step 1: DO D"]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });
});
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
      "steps": [
        {
          "msg": "DO A",
          "rawMsg": "DO A",
          "nextStep": [null],
          "index": 0,
          "type": ""
        }
      ],
      "index": {
        "0": "Point to step 0: DO A"
      },
      "exitSteps": [
        "Point to step 0: DO A"
      ]
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "A",
          "rawMsg": "A",
          "nextStep": [
            null,
            {
              "msg": "DO B",
              "rawMsg": "DO B",
              "nextStep": [],
              "index": 2,
              "type": ""
            }
          ],
          "index": 0,
          "type": "IF"
        }
      ],
      "index": {
        "0": "Point to step 0: IF A",
        "2": "Point to step 2: DO B"
      },
      "exitSteps": [
        "Point to step 0: IF A",
        "Point to step 2: DO B"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  it("should parse flow with IF END 2", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF A
          DO E
          END
        DO B`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "A",
          "rawMsg": "A",
          "nextStep": [
            {
              "msg": "DO E",
              "rawMsg": "DO E",
              "nextStep": [
                null
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO B",
              "rawMsg": "DO B",
              "nextStep": [],
              "index": 3,
              "type": ""
            }
          ],
          "index": 0,
          "type": "IF"
        }
      ],
      "index": {
        "0": "Point to step 0: IF A",
        "1": "Point to step 1: DO E",
        "3": "Point to step 3: DO B"
      },
      "exitSteps": [
        "Point to step 1: DO E",
        "Point to step 3: DO B"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "A",
          "rawMsg": "A",
          "nextStep": [
            null,
            {
              "msg": "DO D",
              "rawMsg": "DO D",
              "nextStep": [],
              "index": 2,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP A",
        "2": "Point to step 2: DO D"
      },
      "exitSteps": [
        "Point to step 0: LOOP A",
        "Point to step 2: DO D"
      ]
    }
    ;
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
});
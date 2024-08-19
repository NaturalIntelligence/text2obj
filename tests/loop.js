const FlowParser = require("./../src/FlowParser"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with loop", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          Do this
          IF condition 2
            DO that
        DO last`;

    const expected = {
      "entryStep": {
        "msg": "condition 1",
        "nextStep": [
          {
            "msg": "this",
            "nextStep": [
              {
                "msg": "condition 2",
                "nextStep": [
                  {
                    "msg": "that",
                    "nextStep": [],
                    "index": 3,
                    "type": "DO"
                  },
                  "Point to step 0: LOOP condition 1"
                ],
                "index": 2,
                "type": "IF"
              }
            ],
            "index": 1,
            "type": "Do"
          },
          {
            "msg": "last",
            "nextStep": [],
            "index": 4,
            "type": "DO"
          }
        ],
        "index": 0,
        "type": "LOOP"
      },
      "exitStep": "Point to step 4: DO last"
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });

  it("should parse flow with loop with break", function() {
  });
  it("should parse flow with loop with continue", function() {
  });
});
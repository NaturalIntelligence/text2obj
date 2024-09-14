const Slimo = require("../src/Slimo"); 
const {customDeepEqual,toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with FOllOW", function() {
    const flowText = `
        FLOW: Addition
        Add both values

        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            FOLLOW Addition
          DO B
        DO C`;

    const expected = {
        "Addition": {
          "name": "Addition",
          "headers": {},
          "steps": [
            {
              "msg": "Add both values",
              "rawMsg": "Add both values",
              "nextStep": [],
              "index": 0,
              "type": ""
            }
          ],
          "index": {
            "0": "Point to step 0: Add both values"
          },
          "exitSteps": [
            "Point to step 0: Add both values"
          ]
        },
        "Sample flow 1": {
          "name": "Sample flow 1",
          "headers": {
            "version": 1,
            "threshold": 5000
          },
          "steps": [
            {
              "msg": "condition 1",
              "rawMsg": "condition 1",
              "nextStep": [
                {
                  "msg": "DO A",
                  "rawMsg": "DO A",
                  "nextStep": [
                    {
                      "msg": "condition 2",
                      "rawMsg": "condition 2",
                      "nextStep": [
                        {
                          "msg": "Addition",
                          "rawMsg": "Addition",
                          "nextStep": [
                            {
                              "msg": "DO B",
                              "rawMsg": "DO B",
                              "nextStep": [
                                "Point to step 0: LOOP condition 1"
                              ],
                              "index": 4,
                              "type": ""
                            }
                          ],
                          "index": 3,
                          "type": "FOLLOW"
                        },
                        "Point to step 4: DO B"
                      ],
                      "index": 2,
                      "type": "IF"
                    }
                  ],
                  "index": 1,
                  "type": ""
                },
                {
                  "msg": "DO C",
                  "rawMsg": "DO C",
                  "nextStep": [],
                  "index": 5,
                  "type": ""
                }
              ],
              "index": 0,
              "type": "LOOP"
            }
          ],
          "index": {
            "0": "Point to step 0: LOOP condition 1",
            "1": "Point to step 1: DO A",
            "2": "Point to step 2: IF condition 2",
            "3": "Point to step 3: FOLLOW Addition",
            "4": "Point to step 4: DO B",
            "5": "Point to step 5: DO C"
          },
          "exitSteps": [
            "Point to step 5: DO C"
          ]
        }
      };
    const parser = new Slimo();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
});
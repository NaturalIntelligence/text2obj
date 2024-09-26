const Slimo = require("../src/Slimo"); 
const {customDeepEqual,toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse duplicate flows", function() {
    const flowText = `
        FLOW: Sample flow
        version: 1.0
        threshold: 5000
        DO A
        END
        
        FLOW: Sample flow
        version: 2.0
        threshold: 5000
        DO B
        END
        `;

    const expected = [
      {
        "name": "Sample flow",
        "headers": {
          "version": 1,
          "threshold": 5000
        },
        "steps": [
          {
            "msg": "DO A",
            "rawMsg": "DO A",
            "nextStep": [
              null
            ],
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
      },
      {
        "name": "Sample flow",
        "headers": {
          "version": 2,
          "threshold": 5000
        },
        "steps": [
          {
            "msg": "DO B",
            "rawMsg": "DO B",
            "nextStep": [
              null
            ],
            "index": 0,
            "type": ""
          }
        ],
        "index": {
          "0": "Point to step 0: DO B"
        },
        "exitSteps": [
          "Point to step 0: DO B"
        ]
      }
    ]
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow"],expected)).toBeTrue();
  });
});
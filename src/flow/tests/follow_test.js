const parse = require("../flow"); 
const {customDeepEqual,toSafeString} = require("../../../tests/util"); 

describe("Flow Parser", function() {
  it("should parse flow with FOllOW", function() {
    const flowText = `
        FLOW: Addition
        Add both values

        FLOW: Sample flow 1
        version: 1.0
        LOOP condition 1
          DO A
          IF condition 2
            FOLLOW Addition
          DO B
        DO C`;

    const expected = [
      {
        "name": "Addition",
        "headers": {},
        "steps": [
          {"msg": "Add both values","rawMsg": "Add both values","type": "","indent": 0 }
        ],
        "links": {
          "0": [-1 ]
        },
        "leveledSteps": [[0]]
      },
      {
        "name": "Sample flow 1",
        "headers": {
          "version": "1.0"
        },
        "steps": [
          { "msg": "condition 1", "rawMsg": "condition 1", "type": "LOOP", "indent": 0  },
          { "msg": "DO A", "rawMsg": "DO A", "type": "", "indent": 1  },
          { "msg": "condition 2", "rawMsg": "condition 2", "type": "IF", "indent": 1  },
          { "msg": "Addition", "rawMsg": "Addition", "type": "FOLLOW", "indent": 2  },
          { "msg": "DO B", "rawMsg": "DO B", "type": "", "indent": 1  },
          { "msg": "DO C", "rawMsg": "DO C", "type": "", "indent": 0  }
        ],
        "links": {
          "0": [ 1, 5 ],
          "1": [ 2 ],
          "2": [ 3, 4 ],
          "3": [ 4 ],
          "4": [ 0 ],
          "5": [-1 ]
        },
        "leveledSteps": [[0,5],[1,2,4],[3]]
      }
    ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
});
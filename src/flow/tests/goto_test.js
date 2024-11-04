const parse = require("../../flow/flow"); 
const {customDeepEqual,toSafeString} = require("../../../tests/util"); 

describe("Flow Parser: GOTO", function() {
  it("should parse flow with IF", function() {
    const flowText = `
        FLOW: Sample flow 1
        [step 1] LOOP condition 1
          DO A
          IF condition 2
            GOTO step 1
          DO B
        DO C`;

    const expected = [
      {
        "name": "Sample flow 1",
        "headers": {},
        "steps": [
          { "msg": "condition 1", "rawMsg": "condition 1", "type": "LOOP", "index": "step 1", "indent": 0  },
          { "msg": "DO A", "rawMsg": "DO A", "type": "", "indent": 1  },
          { "msg": "condition 2", "rawMsg": "condition 2", "type": "IF", "indent": 1  },
          { "msg": "step 1", "rawMsg": "step 1", "type": "GOTO", "indent": 2  },
          { "msg": "DO B", "rawMsg": "DO B", "type": "", "indent": 1  },
          { "msg": "DO C", "rawMsg": "DO C", "type": "", "indent": 0  }
        ],
        "links": {
          "0": [ 1, 5 ],
          "1": [ 2 ],
          "2": [ 0, 4 ],
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
  it("should parse flow after normal step", function() {
    const flowText = `
    FLOW: Sample flow 1
    [step 1]LOOP condition 1
      DO A
      IF condition 2
        DO D
        GOTO step 5
      DO B
      GOTO step 1
    [step 5] DO C`;

    const expected = [
      {
        "name": "Sample flow 1",
        "headers": {},
        "steps": [
          { "msg": "condition 1", "rawMsg": "condition 1", "type": "LOOP", "index": "step 1", "indent": 0},
          { "msg": "DO A", "rawMsg": "DO A", "type": "", "indent": 1},
          { "msg": "condition 2", "rawMsg": "condition 2", "type": "IF", "indent": 1},
          { "msg": "DO D", "rawMsg": "DO D", "type": "", "indent": 2},
          { "msg": "step 5", "rawMsg": "step 5", "type": "GOTO", "indent": 2},
          { "msg": "DO B", "rawMsg": "DO B", "type": "", "indent":  1},
          { "msg": "step 1", "rawMsg": "step 1", "type": "GOTO", "indent": 1},
          { "msg": "DO C", "rawMsg": "DO C", "type": "", "index": "step 5", "indent": 0}
        ],
        "links": {
          "0": [ 1, 7 ],
          "1": [ 2 ],
          "2": [ 3, 5 ],
          "3": [ 7 ],
          "5": [ 0 ],
          "7": [-1 ]
        },
        "leveledSteps": [[0,7],[1,2,5,6],[3,4]]
      }
    ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();

  });

  it("should parse flow with loop in IF ELSE", function() {
    const flowText = `
        FLOW: sample
        LOOP B
          IF D
            GOTO 5
          ELSE F
            G
        [5] K    `;

    const expected = [
      {
        "name": "sample",
        "headers": {},
        "steps": [
          { "msg": "B", "rawMsg": "B", "type": "LOOP", "indent": 0  },
          { "msg": "D", "rawMsg": "D", "type": "IF", "indent": 1  },
          { "msg": "5", "rawMsg": "5", "type": "GOTO", "indent": 2  },
          { "msg": "F", "rawMsg": "F", "type": "ELSE", "indent": 1  },
          { "msg": "G", "rawMsg": "G", "type": "", "indent": 2  },
          { "msg": "K", "rawMsg": "K", "type": "", "index": "5", "indent": 0  }
        ],
        "links": {
          "0": [ 1, 5 ],
          "1": [ 5, 4 ],
          "4": [ 0 ],
          "5": [-1 ]
        },
        "leveledSteps": [[0,5],[1,3],[2,4]]
      }
    ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
  it("should parse flow when GOTO is last step", function() {
    const flowText = `
        FLOW: sample
        [#1] A
        LOOP B
          C
        GOTO #1    `;

    const expected = { '0': [ 1 ], '1': [ 2, 0 ], '2': [ 1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });

  it("should error for GOTO pointing to leaving step", function() {
  });
});
const parse = require("../../flow/flow"); 
const {customDeepEqual,toSafeString} = require("../../../tests/util"); 

describe("Flow Parser", function() {
  it("should parse flow with END", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        DO A
        END`;
    const expected = [
      {
        "name": "Sample flow 1",
        "headers": {
            "version": "1.0",
            "threshold": "5000"
        },
        "steps": [
            { "msg": "DO A","rawMsg": "DO A","type": ""   ,"indent": 0 },
            { "msg": ""    ,"rawMsg": ""    ,"type": "END","indent": 0 }
        ],
        "links": {
            "0": [-1]
        },
        "leveledSteps": [ [0,1] ]
      }];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows, null, 4));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
  it("should parse flow with IF END", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF A
          END
        DO B`;
    const expected = [
      {
          "name": "Sample flow 1",
          "headers": {
              "version": "1.0",
              "threshold": "5000"
          },
          "steps": [
              {"msg": "A","rawMsg": "A","type": "IF","indent": 0 },
              {"msg": "","rawMsg": "","type": "END","indent": 1 },
              {"msg": "DO B","rawMsg": "DO B","type": "","indent": 0 }
          ],
          "links": {
              "0": [-1, 2 ],
              "2": [-1 ]
          },
          "leveledSteps": [ [0,2], [1] ]
      }
  ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows, null, 4));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
  it("should parse flow with IF END 2", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF A
          DO E
          END
        DO B`;
    const expected = [
      {
        "name": "Sample flow 1",
        "headers": {},
        "steps": [
          {"msg": "A","rawMsg": "A","type": "IF","indent": 0 },
          {"msg": "DO E","rawMsg": "DO E","type": "","indent": 1 },
          {"msg": "","rawMsg": "","type": "END","indent": 1 },
          {"msg": "DO B","rawMsg": "DO B","type": "","indent": 0 }
        ],
        "links": {
          "0": [ 1, 3 ],
          "1": [-1 ],
          "3": [-1 ]
        },
        "leveledSteps": [ [ 0, 3 ], [ 1, 2 ] ]
      }
    ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows, null, 2));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
  it("should parse flow with LOOP END", function() {
    const flowText = `
        FLOW: Sample flow 1
        LOOP A
          END
        DO D`;
    const expected = [
      {
        "name": "Sample flow 1",
        "headers": {},
        "steps": [
          {"msg": "A","rawMsg": "A","type": "LOOP","indent": 0 },
          {"msg": "","rawMsg": "","type": "END","indent": 1 },
          {"msg": "DO D","rawMsg": "DO D","type": "","indent": 0 }
        ],
        "links": {
          "0": [-1, 2 ],
          "2": [-1 ]
        },
        "leveledSteps": [[0,2],[1]]
      }];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows, null, 2));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
});
const parse = require("../../src/flow/flow"); 
const {customDeepEqual,toSafeString} = require("../util"); 

describe("Flow Parser", function() {
  
  it("should parse flow with different indentation on same level", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF cond
          DO No
        DO Yeah`;
    const expected = { '0': [ 1, 2 ], '1': [ 2 ], '2': [ -1 ] }
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    // console.log(flows[0].links);
    // console.log(JSON.stringify(flows[0].links, null, 4));
    expect(flows[0].links).toEqual(expected);

  });
  it("should parse flow with 1 IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF condition
          DO Yes
        `;
    const expected = { '0': [ 1,-1 ], '1': [ -1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });
  it("should parse flow with IF ELSE statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF 2 
          IF 1
            DO A
          ELSE
            DO B
        `;
    const expected = { '0': [ 1, -1 ], '1': [ 2, 4 ], '2': [ -1 ], '4': [ -1 ] }
    
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });
  it("should parse flow with nested IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF condition 1
          IF condition 2
            DO Yes
        DO No
        `;
    const expected = { '0': [ 1, 3 ], '1': [ 2, 3 ], '2': [ 3 ], '3': [ -1 ] }
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });
  it("should parse flow with IF ELSE_IF and ELSE statements", function() {
    const flowText = `
FLOW: Sample flow 1
DO A
IF condition 1
  DO C
ELSE_IF condition 2
  DO K
ELSE
  DO D
DO E`;
    const expected = {
      '0': [ 1 ],
      '1': [ 2, 3 ],
      '2': [ 5 ],
      '3': [ 4, 6 ],
      '4': [ 7 ],
      '6': [ 7 ],
      '7': [ -1 ]
    }    
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });
});


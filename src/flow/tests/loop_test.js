const parse = require("../../flow/flow"); 
const {customDeepEqual, toSafeString} = require("../../../tests/util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
        FLOW: Sample flow 1
        LOOP condition 1
          DO this
          IF condition 2
            DO that
        DO last`;

    const expected = { '0': [ 1, 4 ], '1': [ 2 ], '2': [ 3, 0 ], '3': [ 0 ], '4': [ -1 ] }
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop and nested IF condition", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            IF condition 3
              DO B
        DO C`;

    const expected = {
      '0': [ 1, 5 ],
      '1': [ 2 ],
      '2': [ 3, 0 ],
      '3': [ 4, 0 ],
      '4': [ 0 ],
      '5': [ -1 ]
    };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
});
describe("Flow Parser: LOOP: SKIP", function() {
  it("should parse flow with loop with SKIP", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            SKIP
          DO B
        DO C`;

    const expected = { '0': [ 1, 5 ], '1': [ 2 ], '2': [ 0, 4 ], '4': [ 0 ], '5': [ -1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop with SKIP in ELSE", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            DO K
          ELSE
            SKIP
          DO B
        DO C`;

    const expected = {
      '0': [ 1, 7 ],
      '1': [ 2 ],
      '2': [ 3, 0 ],
      '3': [ 6 ],
      '6': [ 0 ],
      '7': [ -1 ]
    };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop with SKIP (not fist step)", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            DO K 
            SKIP
          DO B
        DO C`;

    const expected = {
      '0': [ 1, 6 ],
      '1': [ 2 ],
      '2': [ 3, 5 ],
      '3': [ 0 ],
      '5': [ 0 ],
      '6': [ -1 ]
    };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
});

describe("Flow Parser: LOOP: STOP", function() {
  it("should parse flow with loop with STOP", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            DO D
            STOP
          DO B
        DO C`;

    const expected = {
      '0': [ 1, 6 ],
      '1': [ 2 ],
      '2': [ 3, 5 ],
      '3': [ 6 ],
      '5': [ 0 ],
      '6': [ -1 ]
    };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop with STOP, no ending step", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            DO D
            STOP
          DO B`;

    const expected = { '0': [ 1 ,-1], '1': [ 2 ], '2': [ 3, 5 ], '3': [ -1 ], '5': [ 0 ] }
    ;
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop with STOP in IF ELSE", function() {
    const flowText = `
        FLOW: sample
        LOOP B
          IF D
            STOP
          ELSE F
            G
        K    `;

    const expected = { '0': [ 1, 5 ], '1': [ 5, 4 ], '4': [ 0 ], '5': [ -1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["sample"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should parse flow with loop with STOP in IF ELSE and no end step", function() {
    const flowText = `
        FLOW: sample
        LOOP B
          IF D
            STOP
          ELSE F
            G`;

    const expected = { '0': [ 1,-1 ], '1': [ -1, 4 ], '4': [ 0 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["sample"]));
    // console.log(flows[0].links);
    expect(flows[0].links).toEqual(expected);
  });
  it("should point to next step of upper level if no step in LOOP level", function() {
    const flowText = `
        FLOW: sample
        IF K
          LOOP A
            IF B
              STOP
        D`;

    const expected = { '0': [ 1, 4 ], '1': [ 2, 4 ], '2': [ 4, 1 ], '4': [ -1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["sample"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
  it("should point to next non-ELSE step of upper level if no step in LOOP level", function() {
    const flowText = `
        FLOW: sample
        IF K
          LOOP A
            IF B
              STOP
        ELSE_IF C
          D`;

    const expected = { '0': [ 1, 4 ], '1': [ 2, -1 ], '2': [ -1, 1 ], '4': [ 5, -1 ], '5': [ -1 ] };
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["sample"]));
    // console.log(flows[0].links);
    expect(customDeepEqual(flows[0].links,expected)).toBeTrue();
  });
});
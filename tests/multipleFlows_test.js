const parse = require("../src/flow/flow"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser: Multiple flows", function() {
  it("should parse when STOP is Ending step", function() {
    const flowText = `
        FLOW: first flow
        this is the sample flow
        LOOP 4 times
          until the next condition is true
          IF true
            mark it complete
            STOP

        FLOW: 2nd flow
        of 1 line
      `;

    const expected = [
      { '0': [ 1 ], '1': [ 2, -1 ], '2': [ 3 ], '3': [ 4, 1 ], '4': [ -1 ] },
      { '0': [ -1 ] }
    ];
    
    const flows = parse(flowText);
    // console.log(flows[0].links);
    // console.log(flows[1].links);
    expect(flows[0].links).toEqual(expected[0]);
    expect(flows[1].links).toEqual(expected[1]);
  });

  it("should parse when END is Ending step", function() {
    const flowText = `
        FLOW: first flow
        this is the sample flow
        LOOP 4 times
          until the next condition is true
          IF true
            mark it complete
            END

        FLOW: 2nd flow
        of 1 line
      `;

    const expected = [
      { '0': [ 1 ], '1': [ 2,-1 ], '2': [ 3 ], '3': [ 4, 1 ], '4': [ -1 ] },
      { '0': [ -1 ] }

    ]

    const flows = parse(flowText);
    // console.log(toSafeString(flows));
    // console.log(flows[0].links);
    // console.log(flows[1].links);
    expect(flows[0].links).toEqual(expected[0]);
    expect(flows[1].links).toEqual(expected[1]);
  });
});
const parse = require("../flow"); 
const {customDeepEqual, toSafeString} = require("../../../tests/util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
FLOW: passed as parameter
IF not
  but
ELSE_IF else if
  B
ELSE
  A
`;

    
    const flows = parse(flowText);
    console.log(flows[0].links);
    // expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
});
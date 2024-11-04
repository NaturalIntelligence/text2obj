const parse = require("../flow/flow/flow"); 
const {customDeepEqual, toSafeString} = require("../../../tests/util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
FLOW: Sample flow 1
version:  1.0
threshold: 6000
LOOP (source is) readable
  THEN read a character (of input buffer)
  IF statement 
    IF another statement
      THEN found here
      AND copy data
    ELSE_IF parallel statement
      DO nothing
      ERR Unexpected end of input
      END
    ELSE last statement
  ELSE something
  IF optional
DO in end
`;

    
    const flows = parse(flowText);
    console.log(toSafeString(flows));
    // expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
});
const Slimo = require("../src/Slimo"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
        FLOW: first flow
        this is the sample flow
        LOOP 4 times
          until the next condition is true
          IF true
            mark it complete
            STOP`;

    
    const flows = Slimo.parse(flowText);
    console.log(toSafeString(flows["first flow"]));
    // expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
});
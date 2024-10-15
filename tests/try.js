const Slimo = require("../src/Slimo"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
FLOW: sample
version: 1.0
threshold: 5000
LOOP condition 1
  DO A
  IF condition 2
    DO D
    GOTO 6
  DO B
DO C`;

    
    const flows = Slimo.parse(flowText);
    console.log(toSafeString(flows["sample"][0]));
    // expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
});
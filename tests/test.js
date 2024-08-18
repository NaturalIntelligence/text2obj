const FlowParser = require("./../src/FlowParser"); 
const {customDeepEqual} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with no statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": null,
          "exitStep": null
      },
      "index": {}
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  it("should parse flow with 1 DO statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        DO Yes`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": {
              "msg": "Yes",
              "nextStep": [],
              "index": 0,
              "type": "DO"
          },
          "exitStep": {
              "msg": "Yes",
              "nextStep": [],
              "index": 0,
              "type": "DO"
          }
      },
      "index": {
          "1": {
              "msg": "Yes",
              "nextStep": [],
              "index": 0,
              "type": "DO"
          }
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();

  });
  it("should parse flow with different indentation on same level", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF cond
          DO No
        DO Yeah`;
    const expectedSteps = {
      "entryStep": {
          "msg": "cond",
          "nextStep": [
              {
                  "msg": "No",
                  "nextStep": [
                      {
                          "msg": "Yeah",
                          "nextStep": [],
                          "index": 2,
                          "type": "DO"
                      }
                  ],
                  "index": 1,
                  "type": "DO"
              },
              {
                  "msg": "Yeah",
                  "nextStep": [],
                  "index": 2,
                  "type": "DO"
              }
          ],
          "index": 0,
          "type": "IF"
      },
      "exitStep": {
          "msg": "Yeah",
          "nextStep": [],
          "index": 2,
          "type": "DO"
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expectedSteps)).toBeTrue();

  });
  it("should parse flow with 1 IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF condition
          DO Yes
        `;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 7000
      },
      "steps": {
          "entryStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1,
                      "type": "DO"
                  }
              ],
              "index": 0,
              "type": "IF"
          },
          "exitStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1,
                      "type": "DO"
                  }
              ],
              "index": 0,
              "type": "IF"
          }
      },
      "index": {
          "1": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1,
                      "type": "DO"
                  }
              ],
              "index": 0,
              "type": "IF"
          },
          "2": {
              "msg": "Yes",
              "nextStep": [],
              "index": 1,
              "type": "DO"
          }
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
  it("should parse flow with IF ELSE_IF and ELSE statements", function() {
    const flowText = `
FLOW: Sample flow 1
version: 1.0
threshold: 5000
DO A
IF condition 1
  DO C
ELSE_IF condition 2
  DO K
ELSE
  DO D
DO E`;
    const expected = {
      "entryStep": {
          "msg": "A",
          "nextStep": [
              {
                  "msg": "condition 1",
                  "nextStep": [
                      {
                          "msg": "C",
                          "nextStep": [
                              {
                                  "msg": "E",
                                  "nextStep": [],
                                  "index": 7,
                                  "type": "DO"
                              }
                          ],
                          "index": 2,
                          "type": "DO"
                      },
                      {
                          "msg": "condition 2",
                          "nextStep": [
                              {
                                  "msg": "K",
                                  "nextStep": [
                                      {
                                          "msg": "E",
                                          "nextStep": [],
                                          "index": 7,
                                          "type": "DO"
                                      }
                                  ],
                                  "index": 4,
                                  "type": "DO"
                              },
                              {
                                  "msg": "D",
                                  "nextStep": [
                                      {
                                          "msg": "E",
                                          "nextStep": [],
                                          "index": 7,
                                          "type": "DO"
                                      }
                                  ],
                                  "index": 6,
                                  "type": "DO"
                              }
                          ],
                          "index": 3,
                          "type": "ELSE_IF"
                      }
                  ],
                  "index": 1,
                  "type": "IF"
              }
          ],
          "index": 0,
          "type": "DO"
      },
      "exitStep": {
          "msg": "E",
          "nextStep": [],
          "index": 7,
          "type": "DO"
      }
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });
});


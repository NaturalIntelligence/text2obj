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
              "index": 0
          },
          "exitStep": {
              "msg": "Yes",
              "nextStep": [],
              "index": 0
          }
      },
      "index": {
          "1": {
              "msg": "Yes",
              "nextStep": [],
              "index": 0
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
                          "index": 2
                      }
                  ],
                  "index": 1
              },
              {
                  "msg": "Yeah",
                  "nextStep": [],
                  "index": 2
              }
          ],
          "index": 0
      },
      "exitStep": {
          "msg": "Yeah",
          "nextStep": [],
          "index": 2
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
        version: 1.0
        threshold: 5000
        IF condition
          DO Yes
        `;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": {
          "entryStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1
                  }
              ],
              "index": 0
          },
          "exitStep": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1
                  }
              ],
              "index": 0
          }
      },
      "index": {
          "1": {
              "msg": "condition",
              "nextStep": [
                  {
                      "msg": "Yes",
                      "nextStep": [],
                      "index": 1
                  }
              ],
              "index": 0
          },
          "2": {
              "msg": "Yes",
              "nextStep": [],
              "index": 1
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
                                    "index": 7
                                }
                            ],
                            "index": 2
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
                                            "index": 7
                                        }
                                    ],
                                    "index": 4
                                },
                                {
                                    "msg": "D",
                                    "nextStep": [
                                        {
                                            "msg": "E",
                                            "nextStep": [],
                                            "index": 7
                                        }
                                    ],
                                    "index": 6
                                }
                            ],
                            "index": 3
                        }
                    ],
                    "index": 1
                }
            ],
            "index": 0
        },
        "exitStep": {
            "msg": "E",
            "nextStep": [],
            "index": 7
        }
      };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });
});


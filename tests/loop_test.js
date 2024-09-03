const FlowParser = require("../src/FlowParser"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser: LOOP", function() {
  it("should parse flow with loop", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO this
          IF condition 2
            DO that
        DO last`;

    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO this",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO that",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 3,
                      "type": ""
                    },
                    "Point to step 0: LOOP condition 1"
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO last",
              "nextStep": [],
              "index": 4,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO this",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO that",
        "4": "Point to step 4: DO last"
      },
      "exitSteps": [
        "Point to step 4: DO last"
      ]
    }
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "condition 3",
                      "nextStep": [
                        {
                          "msg": "DO B",
                          "nextStep": [
                            "Point to step 0: LOOP condition 1"
                          ],
                          "index": 4,
                          "type": ""
                        },
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 3,
                      "type": "IF"
                    },
                    "Point to step 0: LOOP condition 1"
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO C",
              "nextStep": [],
              "index": 5,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: IF condition 3",
        "4": "Point to step 4: DO B",
        "5": "Point to step 5: DO C"
      },
      "exitSteps": [
        "Point to step 5: DO C"
      ]
    }
    ;
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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

    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    "Point to step 0: LOOP condition 1",
                    {
                      "msg": "DO B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 4,
                      "type": ""
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO C",
              "nextStep": [],
              "index": 5,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "4": "Point to step 4: DO B",
        "5": "Point to step 5: DO C"
      },
      "exitSteps": [
        "Point to step 5: DO C"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO K",
                      "nextStep": [
                        {
                          "msg": "DO B",
                          "nextStep": [
                            "Point to step 0: LOOP condition 1"
                          ],
                          "index": 6,
                          "type": ""
                        }
                      ],
                      "index": 3,
                      "type": ""
                    },
                    "Point to step 0: LOOP condition 1"
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO C",
              "nextStep": [],
              "index": 7,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO K",
        "4": {
          "nextStep": [
            "Point to step 6: DO B"
          ],
          "index": 4,
          "type": "ELSE"
        },
        "6": "Point to step 6: DO B",
        "7": "Point to step 7: DO C"
      },
      "exitSteps": [
        "Point to step 7: DO C"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO K",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 3,
                      "type": ""
                    },
                    {
                      "msg": "DO B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 5,
                      "type": ""
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            {
              "msg": "DO C",
              "nextStep": [],
              "index": 6,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO K",
        "5": "Point to step 5: DO B",
        "6": "Point to step 6: DO C"
      },
      "exitSteps": [
        "Point to step 6: DO C"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO D",
                      "nextStep": [
                        {
                          "msg": "DO C",
                          "nextStep": [],
                          "index": 6,
                          "type": ""
                        }
                      ],
                      "index": 3,
                      "type": ""
                    },
                    {
                      "msg": "DO B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 5,
                      "type": ""
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            },
            "Point to step 6: DO C"
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO D",
        "5": "Point to step 5: DO B",
        "6": "Point to step 6: DO C"
      },
      "exitSteps": [
        "Point to step 6: DO C"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
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

    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO D",
                      "nextStep": [
                        null
                      ],
                      "index": 3,
                      "type": ""
                    },
                    {
                      "msg": "DO B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 5,
                      "type": ""
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": ""
            }
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: DO A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO D",
        "5": "Point to step 5: DO B"
      },
      "exitSteps": [
        "Point to step 0: LOOP condition 1",
        "Point to step 3: DO D"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
});
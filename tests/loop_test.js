const FlowParser = require("../src/FlowParser"); 
const {customDeepEqual, toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with loop", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          Do this
          IF condition 2
            DO that
        DO last`;

    const expected = {
      "entryStep": {
        "msg": "condition 1",
        "nextStep": [
          {
            "msg": "this",
            "nextStep": [
              {
                "msg": "condition 2",
                "nextStep": [
                  {
                    "msg": "that",
                    "nextStep": [
                      "Point to step 0: LOOP condition 1"
                    ],
                    "index": 3,
                    "type": "DO"
                  },
                  "Point to step 0: LOOP condition 1"
                ],
                "index": 2,
                "type": "IF"
              }
            ],
            "index": 1,
            "type": "Do"
          },
          {
            "msg": "last",
            "nextStep": [],
            "index": 4,
            "type": "DO"
          }
        ],
        "index": 0,
        "type": "LOOP"
      },
      "exitStep": [
        "Point to step 4: DO last"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });
  it("should parse flow with loop and nested IF condition", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          Do A
          IF condition 2
            IF condition 3
              DO B
        DO C`;

    const expected = {
      "entryStep": {
        "msg": "condition 1",
        "nextStep": [
          {
            "msg": "A",
            "nextStep": [
              {
                "msg": "condition 2",
                "nextStep": [
                  {
                    "msg": "condition 3",
                    "nextStep": [
                      {
                        "msg": "B",
                        "nextStep": [
                          "Point to step 0: LOOP condition 1"
                        ],
                        "index": 4,
                        "type": "DO"
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
            "type": "Do"
          },
          {
            "msg": "C",
            "nextStep": [],
            "index": 5,
            "type": "DO"
          }
        ],
        "index": 0,
        "type": "LOOP"
      },
      "exitStep": [
        "Point to step 5: DO C"
      ]
    };
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"].steps,expected)).toBeTrue();
  });

  it("should parse flow with loop with SKIP", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          Do A
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
      "steps": {
        "entryStep": {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    "Point to step 0: LOOP condition 1",
                    {
                      "msg": "B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 4,
                      "type": "DO"
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": "Do"
            },
            {
              "msg": "C",
              "nextStep": [],
              "index": 5,
              "type": "DO"
            }
          ],
          "index": 0,
          "type": "LOOP"
        },
        "exitStep": [
          "Point to step 5: DO C"
        ]
      },
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: Do A",
        "2": "Point to step 2: IF condition 2",
        "3": {
          "nextStep": [
            "Point to step 0: LOOP condition 1"
          ],
          "index": 3,
          "type": "SKIP"
        },
        "4": "Point to step 4: DO B",
        "5": "Point to step 5: DO C"
      }
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
          Do A
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
      "steps": {
        "entryStep": {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "K",
                      "nextStep": [
                        {
                          "msg": "B",
                          "nextStep": [
                            "Point to step 0: LOOP condition 1"
                          ],
                          "index": 6,
                          "type": "DO"
                        }
                      ],
                      "index": 3,
                      "type": "DO"
                    },
                    "Point to step 0: LOOP condition 1"
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": "Do"
            },
            {
              "msg": "C",
              "nextStep": [],
              "index": 7,
              "type": "DO"
            }
          ],
          "index": 0,
          "type": "LOOP"
        },
        "exitStep": [
          "Point to step 7: DO C"
        ]
      },
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: Do A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO K",
        "4": {
          "nextStep": [
            "Point to step 6: DO B"
          ],
          "index": 4,
          "type": "ELSE"
        },
        "5": {
          "nextStep": [
            "Point to step 0: LOOP condition 1"
          ],
          "index": 5,
          "type": "SKIP"
        },
        "6": "Point to step 6: DO B",
        "7": "Point to step 7: DO C"
      }
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
          Do A
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
      "steps": {
        "entryStep": {
          "msg": "condition 1",
          "nextStep": [
            {
              "msg": "A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "K",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 3,
                      "type": "DO"
                    },
                    {
                      "msg": "B",
                      "nextStep": [
                        "Point to step 0: LOOP condition 1"
                      ],
                      "index": 5,
                      "type": "DO"
                    }
                  ],
                  "index": 2,
                  "type": "IF"
                }
              ],
              "index": 1,
              "type": "Do"
            },
            {
              "msg": "C",
              "nextStep": [],
              "index": 6,
              "type": "DO"
            }
          ],
          "index": 0,
          "type": "LOOP"
        },
        "exitStep": [
          "Point to step 6: DO C"
        ]
      },
      "index": {
        "0": "Point to step 0: LOOP condition 1",
        "1": "Point to step 1: Do A",
        "2": "Point to step 2: IF condition 2",
        "3": "Point to step 3: DO K",
        "4": {
          "nextStep": [],
          "index": 4,
          "type": "SKIP"
        },
        "5": "Point to step 5: DO B",
        "6": "Point to step 6: DO C"
      }
    }
    ;
    const parser = new FlowParser();
    const flows = parser.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"],expected)).toBeTrue();
  });
});
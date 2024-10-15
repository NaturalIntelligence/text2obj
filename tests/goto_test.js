const Slimo = require("../src/Slimo"); 
const {customDeepEqual,toSafeString} = require("./util"); 

describe("Flow Parser", function() {
  it("should parse flow with GOTO after IF", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        LOOP condition 1
          DO A
          IF condition 2
            GOTO step 1
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
          "rawMsg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "rawMsg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "rawMsg": "condition 2",
                  "nextStep": [
                    "Point to step 1: DO A",
                    {
                      "msg": "DO B",
                      "rawMsg": "DO B",
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
              "rawMsg": "DO C",
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
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
  it("should parse flow with GOTO after normal step", function() {
    const flowText = `
    FLOW: Sample flow 1
    version: 1.0
    threshold: 5000
    LOOP condition 1
      DO A
      IF condition 2
        DO D
        GOTO step 5
      DO B
      GOTO step 1
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
          "rawMsg": "condition 1",
          "nextStep": [
            {
              "msg": "DO A",
              "rawMsg": "DO A",
              "nextStep": [
                {
                  "msg": "condition 2",
                  "rawMsg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO D",
                      "rawMsg": "DO D",
                      "nextStep": [
                        {
                          "msg": "DO B",
                          "rawMsg": "DO B",
                          "nextStep": [
                            "Point to step 1: DO A"
                          ],
                          "index": 5,
                          "type": ""
                        }
                      ],
                      "index": 3,
                      "type": ""
                    },
                    "Point to step 5: DO B"
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
              "rawMsg": "DO C",
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
        "3": "Point to step 3: DO D",
        "5": "Point to step 5: DO B",
        "7": "Point to step 7: DO C"
      },
      "exitSteps": [
        "Point to step 7: DO C"
      ]
    };
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();

  });

  it("should parse flow with loop with GOTO in IF ELSE", function() {
    const flowText = `
        FLOW: sample
        LOOP B
          IF D
            GOTO 5
          ELSE F
            G
        K    `;

    const expected = {
      "name": "sample",
      "headers": {},
      "steps": [
        {
          "msg": "B",
          "rawMsg": "B",
          "nextStep": [
            {
              "msg": "D",
              "rawMsg": "D",
              "nextStep": [
                {
                  "msg": "K",
                  "rawMsg": "K",
                  "nextStep": [],
                  "index": 5,
                  "type": ""
                },
                {
                  "msg": "G",
                  "rawMsg": "G",
                  "nextStep": [
                    "Point to step 0: LOOP B"
                  ],
                  "index": 4,
                  "type": ""
                }
              ],
              "index": 1,
              "type": "IF"
            },
            "Point to step 5: K"
          ],
          "index": 0,
          "type": "LOOP"
        }
      ],
      "index": {
        "0": "Point to step 0: LOOP B",
        "1": "Point to step 1: IF D",
        "3": {
          "msg": "F",
          "rawMsg": "F",
          "nextStep": [],
          "index": 3,
          "type": "ELSE"
        },
        "4": "Point to step 4: G",
        "5": "Point to step 5: K"
      },
      "exitSteps": [
        "Point to step 5: K"
      ]
    };
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["sample"]));
    expect(customDeepEqual(flows["sample"][0],expected)).toBeTrue();
  });

  it("should error for GOTO pointing to leaving step", function() {
  });
});
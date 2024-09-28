const Slimo = require("../src/Slimo"); 
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

    const expected = {
      "first flow": [
        {
          "name": "first flow",
          "headers": {},
          "steps": [
            {
              "msg": "this is the sample flow",
              "rawMsg": "this is the sample flow",
              "nextStep": [
                {
                  "msg": "4 times",
                  "rawMsg": "4 times",
                  "nextStep": [
                    {
                      "msg": "until the next condition is true",
                      "rawMsg": "until the next condition is true",
                      "nextStep": [
                        {
                          "msg": "true",
                          "rawMsg": "true",
                          "nextStep": [
                            {
                              "msg": "mark it complete",
                              "rawMsg": "mark it complete",
                              "nextStep": [
                                null
                              ],
                              "index": 4,
                              "type": ""
                            },
                            "Point to step 1: LOOP 4 times"
                          ],
                          "index": 3,
                          "type": "IF"
                        }
                      ],
                      "index": 2,
                      "type": ""
                    }
                  ],
                  "index": 1,
                  "type": "LOOP"
                }
              ],
              "index": 0,
              "type": ""
            }
          ],
          "index": {
            "0": "Point to step 0: this is the sample flow",
            "1": "Point to step 1: LOOP 4 times",
            "2": "Point to step 2: until the next condition is true",
            "3": "Point to step 3: IF true",
            "4": "Point to step 4: mark it complete"
          },
          "exitSteps": [
            "Point to step 1: LOOP 4 times",
            "Point to step 4: mark it complete"
          ]
        }
      ],
      "2nd flow": [
        {
          "name": "2nd flow",
          "headers": {},
          "steps": [
            {
              "msg": "of 1 line",
              "rawMsg": "of 1 line",
              "nextStep": [],
              "index": 0,
              "type": ""
            }
          ],
          "index": {
            "0": "Point to step 0: of 1 line"
          },
          "exitSteps": [
            "Point to step 0: of 1 line"
          ]
        }
      ]
    };
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();
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

    const expected = {
      "first flow": [
        {
          "name": "first flow",
          "headers": {},
          "steps": [
            {
              "msg": "this is the sample flow",
              "rawMsg": "this is the sample flow",
              "nextStep": [
                {
                  "msg": "4 times",
                  "rawMsg": "4 times",
                  "nextStep": [
                    {
                      "msg": "until the next condition is true",
                      "rawMsg": "until the next condition is true",
                      "nextStep": [
                        {
                          "msg": "true",
                          "rawMsg": "true",
                          "nextStep": [
                            {
                              "msg": "mark it complete",
                              "rawMsg": "mark it complete",
                              "nextStep": [
                                null
                              ],
                              "index": 4,
                              "type": ""
                            },
                            "Point to step 1: LOOP 4 times"
                          ],
                          "index": 3,
                          "type": "IF"
                        }
                      ],
                      "index": 2,
                      "type": ""
                    }
                  ],
                  "index": 1,
                  "type": "LOOP"
                }
              ],
              "index": 0,
              "type": ""
            }
          ],
          "index": {
            "0": "Point to step 0: this is the sample flow",
            "1": "Point to step 1: LOOP 4 times",
            "2": "Point to step 2: until the next condition is true",
            "3": "Point to step 3: IF true",
            "4": "Point to step 4: mark it complete"
          },
          "exitSteps": [
            "Point to step 4: mark it complete",
            "Point to step 1: LOOP 4 times"
          ]
        }
      ],
      "2nd flow": [
        {
          "name": "2nd flow",
          "headers": {},
          "steps": [
            {
              "msg": "of 1 line",
              "rawMsg": "of 1 line",
              "nextStep": [],
              "index": 0,
              "type": ""
            }
          ],
          "index": {
            "0": "Point to step 0: of 1 line"
          },
          "exitSteps": [
            "Point to step 0: of 1 line"
          ]
        }
      ]
    }

    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows));
    expect(customDeepEqual(flows,expected)).toBeTrue();
  });
});
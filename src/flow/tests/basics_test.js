const parse = require("../flow"); 
const {customDeepEqual,toSafeString} = require("../../../tests/util"); 

describe("Flow Parser", function() {
    it("should parse flow with no statement", function() {
        const flowText = `
            FLOW: Sample flow 1
            version: 1.0
            threshold: 5000`;
        const expected = [
            {
                "name": "Sample flow 1",
                "headers": {
                    "version": "1.0",
                    "threshold": "5000"
                },
                "steps": [],
                "links": {},
                "leveledSteps": [
                    []
                ]
            }
        ];
        
        const flows = parse(flowText);
        // console.log(JSON.stringify(flows, null, 4));
        expect(customDeepEqual(flows,expected)).toBeTrue();
    });
  it("should parse duplicate flows", function() {
    const flowText = `
        FLOW: Sample flow
        version: 1.0
        threshold: 5000
        DO A
        END
        
        FLOW: Sample flow
        version: 2.0
        threshold: 5000
        DO B
        END
        `;

    const expected = [
      {
        "name": "Sample flow",
        "headers": {
            "version": "1.0",
            "threshold": "5000"
        },
        "steps": [
            { "msg": "DO A","rawMsg": "DO A","type": ""   ,"indent": 0 },
            { "msg": ""    ,"rawMsg": ""    ,"type": "END","indent": 0 }
        ],
        "links": {
            "0": [-1]
        },
        "leveledSteps": [ [0,1] ]
      },
      {
          "name": "Sample flow",
          "headers": {
              "version": "2.0",
              "threshold": "5000"
          },
          "steps": [
              { "msg": "DO B","rawMsg": "DO B","type": ""   ,"indent": 0 },
              { "msg": ""    ,"rawMsg": ""    ,"type": "END","indent": 0 }
          ],
          "links": {
              "0": [-1]
          },
          "leveledSteps": [ [0,1] ]
      }
  ];
    
    const flows = parse(flowText);
    // console.log(toSafeString(flows["Sample flow"]));
    // console.log(JSON.stringify(flows, null, 2));
    expect(customDeepEqual(flows,expected)).toBeTrue();
    // expect(flows).toEqual(expected);
  });
});
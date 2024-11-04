# text2obj
With due respect to all the text to diagram generators, the aim of this library is to parse text given in expected format and generate an intermediate object that can be used to draw diagrams or use in some kind of automation.

Currently, this library supports parsing algorithm(or flow) to generate flow chart.

Sample Flow
```
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
```

```js
const parse = require("@solothought/text2obj/flow")

const flows = parse(flowText);
flows['Sample flow 1];
```
Output
```

[
  {
    "name": "Sample flow 1",
    "headers": {
      "version": "1.0",
      "threshold": "6000"
    },
    "steps": [
      { "msg": "readable", "rawMsg": "(source is) readable", "type": "LOOP", "indent": 0  },
      {
        "msg": "read a character",
        "rawMsg": "read a character (of input buffer)",
        "type": "THEN",
        "indent": 1
      },
      { "msg": "statement", "rawMsg": "statement", "type": "IF", "indent": 1  },
      { "msg": "another statement", "rawMsg": "another statement", "type": "IF", "indent": 2  },
      { "msg": "found here", "rawMsg": "found here", "type": "THEN", "indent": 3  },
      { "msg": "copy data", "rawMsg": "copy data", "type": "AND", "indent": 3  },
      { "msg": "parallel statement", "rawMsg": "parallel statement", "type": "ELSE_IF", "indent": 2  },
      { "msg": "DO nothing", "rawMsg": "DO nothing", "type": "", "indent": 3  },
      {
        "msg": "Unexpected end of input",
        "rawMsg": "Unexpected end of input",
        "type": "ERR",
        "indent": 3
      },
      { "msg": "", "rawMsg": "", "type": "END", "indent": 3  },
      { "msg": "last statement", "rawMsg": "last statement", "type": "ELSE", "indent": 2  },
      { "msg": "something", "rawMsg": "something", "type": "ELSE", "indent": 1  },
      { "msg": "optional", "rawMsg": "optional", "type": "IF", "indent": 1  },
      { "msg": "DO in end", "rawMsg": "DO in end", "type": "", "indent":       }
    ],
    "links": {
      "0":  [ 1, 13 ],
      "1":  [ 2 ],
      "2":  [ 3, 12 ],
      "3":  [ 4, 6 ],
      "4":  [ 5 ],
      "5":  [ 10 ],
      "6":  [ 7, 11 ],
      "7":  [ 8 ],
      "8":  [-1 ],
      "12": [ null, 0 ],
      "13": [-1 ]
    },
    "leveledSteps": [[0,13],[1,2,11,12],[3,6,10],[4,5,7,8,9]]
  }
]
```

- `-1` means end
- `links` represents linking among steps.
- `leveledSteps` are steps on different indentation. 
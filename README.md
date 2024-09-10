# Slimo


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
const slimo = new Slimo();
const flows = slimo.parse(flowText);
flows['Sample flow 1];
```

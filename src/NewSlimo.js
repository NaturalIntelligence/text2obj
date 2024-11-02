const generateLinks = require("./LinkGenerator");

const branchSteps = ["IF", "ELSE_IF", "LOOP", "ELSE"];
const leavingSteps = ["GOTO", "SKIP", "STOP", "END"];
const normalSteps = ["AND", "THEN", "BUT", "FOLLOW", "ERR"];



function parseAlgorithm(algoText) {
  const lines = algoText.split('\n'); // split and trim lines

  let steps = [];    // To store the message and type of each step
  let links = {};    // To store how steps are connected
  let exitSteps = []; // To store the exit points (steps where flow ends)
  let leveledSteps = [[]];
  let indentLevels = [];
  let curIndentLvl = 0;
  let stepIndex = -1;
  let indexedSteps = {};
  //TODO: 
  // - break on FLOW:
  
  lines.forEach((line, i) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine[0] === "#") return; // Skip empty or comment lines

    stepIndex++;

    const indent = line.search(/\S/);
    let curIndentVal;
    if(indentLevels[curIndentLvl]!== undefined){
      curIndentVal = indentLevels[curIndentLvl];
    }else{
      curIndentVal = indent;
      indentLevels[curIndentLvl] = indent;
    }
    if(curIndentVal === indent){ //same level
      leveledSteps[curIndentLvl].push(stepIndex);
    }else if(curIndentVal < indent){ // next level
      indentLevels[++curIndentLvl] = indent;
      if(leveledSteps[curIndentLvl]){
        leveledSteps[curIndentLvl].push(stepIndex);
      }else{
        leveledSteps.push([stepIndex]);
      }
    }else{ //previous level
      for(;curIndentLvl > -1; curIndentLvl--){
        let lastIndentLvl = indentLevels[curIndentLvl];
        if(lastIndentLvl === indent) break;
      }
      if(curIndentLvl === -1){
        throw new Error(`Indentation issue with line |${line}|`);
      }else{
        leveledSteps[curIndentLvl].push(stepIndex);
      }
    }

    let data = readStep(line.trim());
    data.indent = curIndentLvl;
    if(data.index) indexedSteps[data.index] = stepIndex;
    // steps[stepIndex] = data;
    steps.push(data);
    links[stepIndex] = [];

  });

  
  console.log(leveledSteps);
  console.log(steps);
  generateLinks(steps, indexedSteps, links);
  
  console.log(links);
  return { index: steps, links, exitSteps };
}


/**
 * Sample: [#1] ERR This statement (extra info)
 * @param {string} statement 
 * @returns {{msg:string, rawMsg: string, type:string, index:string, indent:number}}
    {msg: 'This statement',
    rawMsg: 'This statement (extra info)',
    type: 'ERR',
    index: '#1',
    indent: 0}
 */
function readStep(statement) {
  const data = { msg:"", rawMsg: "", type: ""}
  if(statement[0] === '[') {//has index
    const boundary = statement.indexOf("]");
    data.index = statement.substring(1,boundary).trim();
    statement = statement.substring(boundary+1).trimStart();
  }
  const index = statement.indexOf(' ');
  if(index < 1) {
    if(isSupportedKeyword(statement)) data.type = statement;
    else   data.msg = data.rawMsg = statement;
  }else{
    const firstWord = statement.substring(0, index);
    const restStatement = statement.substring(index + 1);

    if(isSupportedKeyword(firstWord)) {
      data.type = firstWord;
      data.rawMsg = restStatement;
      data.msg = refinedMsg(restStatement).trim();
    }else{
      data.rawMsg = statement;
      data.msg = refinedMsg(statement);
    }
  }
  return data;
}

/**
 * Remove extra  info from the message
 * @param {string} msg 
 * @returns {string}
 */
function refinedMsg(msg){
  return msg.replace(/\([^)]*\)/g, '').replace(/\s\s/g,' ');
}

function isSupportedKeyword(k){
  return leavingSteps.indexOf(k) !== -1 || 
    branchSteps.indexOf(k) !== -1 ||
    normalSteps.indexOf(k) !== -1;
}

// Example usage
let input = `
IF root
  LOOP condition 1
    [#1] DO A
    IF condition 2 (extra)
      GOTO #1
    ELSE_IF condition 3
      SKIP
    ELSE_IF condition 4
      LOOP illusion
        ends here
      IF otherwise
        END
      ELSE
        STOP
    this is B
    FOLLOW a new flow
    last here
    #comments are skipped
ELSE_IF admin
  ban
last`;
input = `
[index] ERR This statement (extra info)
`;


const output = parseAlgorithm(input);
// console.log(JSON.stringify(output, null, 2));



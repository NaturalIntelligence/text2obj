const generateLinks = require("./LinkGenerator");

const branchSteps = ["IF", "ELSE_IF", "LOOP", "ELSE"];
const leavingSteps = ["GOTO", "SKIP", "STOP", "END"];
const normalSteps = ["AND", "THEN", "BUT", "FOLLOW", "ERR"];

class Flow {
  constructor(name) {
    this.name = name;
    this.headers = {};
    this.steps = []; // Store step detail
    this.links = {}; // Store links for a step
    this.leveledSteps = [[]]; // store steps indentation wise
    // this.index = {};
    // this.exitSteps = [];
  }
}

function parse(algoText) {
  const lines = algoText.split('\n'); // split and trim lines
  const flows = [];

  let indexedSteps = {}; //used for GOTO statement
  let indentLevels = []; //temp to hold indent detail
  let curIndentLvl = 0;  //temp to hold current indent detail
  let stepIndex = -1;    //temp
  let currentFlow = null;
  let readingHeader = false;
  //TODO: 
  // - read Flow headers

  lines.forEach((line, i) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine[0] === "#") return; // Skip empty or comment lines
    else if (trimmedLine.startsWith("FLOW:")){
      // complete last flow and start new
      if(currentFlow) generateLinks(currentFlow.steps, indexedSteps, currentFlow.links);
      indexedSteps = {}; //reset
      indentLevels = [];
      curIndentLvl  = 0;
      stepIndex = -1
      currentFlow = new Flow(trimmedLine.substring(6));
      flows.push(currentFlow);
      readingHeader = true;
      return;
    }else if(readingHeader && trimmedLine.match(/^[a-z]{1,70}:/)) {//reading header
      const [key, value] = line.split(':');
      currentFlow.headers[key.trim()] = value.trim();
      return;
    }else{
      readingHeader = false;
    }

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
      currentFlow.leveledSteps[curIndentLvl].push(stepIndex);
    }else if(curIndentVal < indent){ // next level
      indentLevels[++curIndentLvl] = indent;
      if(currentFlow.leveledSteps[curIndentLvl]){
        currentFlow.leveledSteps[curIndentLvl].push(stepIndex);
      }else{
        currentFlow.leveledSteps.push([stepIndex]);
      }
    }else{ //previous level
      for(;curIndentLvl > -1; curIndentLvl--){
        let lastIndentLvl = indentLevels[curIndentLvl];
        if(lastIndentLvl === indent) break;
      }
      if(curIndentLvl === -1){
        throw new Error(`Indentation issue with line |${line}|`);
      }else{
        currentFlow.leveledSteps[curIndentLvl].push(stepIndex);
      }
    }

    let data = readStep(line.trim());
    data.indent = curIndentLvl;
    if(data.index) indexedSteps[data.index] = stepIndex;
    currentFlow.steps.push(data);
    currentFlow.links[stepIndex] = [];

  });

  
  generateLinks(currentFlow.steps, indexedSteps, currentFlow.links); //for last flow
  return flows;
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
      statement = restStatement;
    }else{
    }
    data.rawMsg = statement.replace(/\s+/g," ");
    data.msg = refinedMsg(statement).replace(/\s+/g," ");
  }
  return data;
}


/**
 * Remove extra  info from the message
 * @param {string} msg 
 * @returns {string}
 */
function refinedMsg(msg){
  let count = 0;
  let newmsg = "";
  for (let i = 0; i < msg.length; i++) {
    const ch = msg[i];
    if(ch==="(") count++;
    else if(ch===")") count--;
    else {
      if(count > 0) continue;
      else newmsg += ch;
    }
  }
  return newmsg.trim();
}

function isSupportedKeyword(k){
  return leavingSteps.indexOf(k) !== -1 || 
    branchSteps.indexOf(k) !== -1 ||
    normalSteps.indexOf(k) !== -1;
}

// Example usage
// let input = `
// IF root
//   LOOP condition 1
//     [#1] DO A
//     IF condition 2 (extra)
//       GOTO #1
//     ELSE_IF condition 3
//       SKIP
//     ELSE_IF condition 4
//       LOOP illusion
//         ends here
//       IF otherwise
//         END
//       ELSE
//         STOP
//     this is B
//     FOLLOW a new flow
//     last here
//     #comments are skipped
// ELSE_IF admin
//   ban
// last`;
// input = `
// FLOW: sample
// [index] ERR This statement (extra info)

// FLOW: sample
// this: is header
// [index] ERR This statement (extra info)
// `;


// const output = parse(input);
// console.log(JSON.stringify(output, null, 2));


module.exports = parse;
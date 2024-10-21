const branchSteps = ["IF", "ELSE_IF", "LOOP"];
const leavingSteps = ["GOTO", "SKIP", "STOP", "END"];
const normalSteps = ["AND", "THEN", "BUT", "FOLLOW", "ERR"];

function parseAlgorithm(algoText) {
  const lines = algoText.split('\n'); // split and trim lines

  let index = {};    // To store the message and type of each step
  let links = {};    // To store how steps are connected
  let exitSteps = []; // To store the exit points (steps where flow ends)
  let leveledSteps = [[]];
  let indentLevels = [];
  let curIndentLvl = 0;
  let stepIndex = -1;
  let indexedSteps = {};
  //TODO: 
  // - break on FLOW:
  // - ignore comments
  // - step id for GOTO
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
    }else if(curIndentVal < indent){
      indentLevels[++curIndentLvl] = indent;
      if(leveledSteps[curIndentLvl]){
        leveledSteps[curIndentLvl].push(stepIndex);
      }else{
        leveledSteps.push([stepIndex]);
      }
    }else{
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
    if(data.index) indexedSteps[data.index] = stepIndex;
    index[stepIndex] = data;
    links[stepIndex] = [];

  });

  
  console.log(leveledSteps);
  // console.log(indexedSteps);
  linking(leveledSteps, links, index, indexedSteps);
  return { index, links, exitSteps };
}



/**
 * 
 * @param {[number[]]} levels 
 * @param {object} index 
 */
function  linking(levels, links, index, indexedSteps){
  //FLOW: linking
  //for a branch
  //  point to 
  
  const loopsInScope = [];
  levels.forEach((lvl , lvl_i) => {
    let lastStepType = "";
    lvl.forEach((stepId, i) => {
      const step = index[stepId];
      loopsInScope[lvl_i]=-1; //reset
      //branch
      if(branchSteps.includes(step.type)){
        //validation
        if(step.type === "ELSE_IF" || step.type === "ELSE" ){
          if(lastStepType !== "IF") throw new Error("Invalid IF..ELSE_IF..ELSE sequence");
        }else {
          if(step.type === "LOOP") loopsInScope[lvl_i]=i;
          lastStepType = step.type;
        }        
        // IF next level exist
        //  # next step index exist in next level
        // console.log(lvl_i);
        links[stepId].push( (levels[lvl_i+1] && levels[lvl_i+1].includes(stepId + 1))  ? stepId + 1 : -1 );
        // IF next step on same level exist
        links[stepId].push( lvl[i+1] !== undefined ? lvl[i+1] : -1 );

      }else if(leavingSteps.includes(step.type)){
        //last step in links should have 
        if(step.type === "GOTO"){
          if(indexedSteps[step.msg]) links[stepId - 1][0] = indexedSteps[step.msg];
          delete links[stepId];
        }else if(step.type === "SKIP"){
          //find immediate loop
          let loop_i= loopsInScope.length-1;
          for (; loop_i > -1; loop_i--) {
            const loopStepIndex = loopsInScope[loop_i];
            if(loopStepIndex === -1) continue;
            else {
              links[stepId - 1][0] = loopStepIndex;
              delete links[stepId];
              break;
            }
          }
          if(loop_i === -1){
            throw new Error("SKIP must be used inside a LOOP");
          }
        }

      }

      //leaving steps
    })


  });

  //leaving step


  console.log(links)
}

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

function refinedMsg(msg){
  return msg.replace(/\([^)]*\)/g, '').replace(/\s\s/g,' ');
}

function isSupportedKeyword(k){
  return leavingSteps.indexOf(k) !== -1 || 
    branchSteps.indexOf(k) !== -1 ||
    normalSteps.indexOf(k) !== -1;
}

// Example usage
const input = `
LOOP condition 1
  [#1] DO A
  IF condition 2 (extra)
    GOTO #1
  ELSE_IF condition 3
    SKIP
  ELSE_IF condition 4
    #comment
    END
  this is B
  last`;


const output = parseAlgorithm(input);
console.log(JSON.stringify(output, null, 2));

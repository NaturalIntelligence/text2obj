const branchSteps = ["IF", "ELSE_IF", "ELSE", "LOOP"];
const leavingSteps = ["GOTO", "SKIP", "STOP", "END"];

function isBranchStep(step) {
  return branchSteps.includes(step.type);
}
function isLeavingStep(step) {
  return leavingSteps.includes(step.type);
}


/**
 * A next step is not a child step but a sibling or higher level step
 * Find next step of same level or
 * Find next step of lower level within loop boundary if within loop
 * loop step if no next step of lower level within loop boundary if within loop
 * Find next step of lower level if not in loop
 * -1 if no next step and not in loop
 * 
 * But if next step is ELSE_IF, ELSE type
 *  AND current step is IF/ELSE_IF on same indent level
 * , then we need to find next step of this
 * @param {[number[]]} steps 
 * @param {number} currentStepId 
 * @param {number} indent
 * @returns {number} step id
 */
function findNextStep(steps, currentStepId, parentLoopId) {
  let nextStepId = -2;

  // if(parentLoopId !== undefined && parentLoopId > currentStepId){
  if(parentLoopId !== undefined){
    // Find next step whose indent is less or equal to current indent
    // but higher than loop's indent
    // Otherwise IF next step indent is higher, ignore
    // IF next step indent is higher or equal to loop indent, point to loop

    const parentLoop = steps[parentLoopId];
    const currentIndent = steps[currentStepId].indent;
    for (let i = currentStepId+1; i < steps.length; i++) {
      const nextStepIndent = steps[i].indent;
      if (nextStepIndent === currentIndent){
        nextStepId = i;
        break;
      }else if (nextStepIndent < currentIndent){
        if(nextStepIndent > parentLoop.indent) {
          nextStepId = i;
        }else{
          nextStepId = parentLoopId
        }
        break;
      }
    }
    if(nextStepId === -2) nextStepId = parentLoopId;
  }else{
    for (let i = currentStepId + 1; i < steps.length; i++) {
      if (steps[i].indent <= steps[currentStepId].indent) {
        nextStepId = i;
        break;
      }
    }
    if(nextStepId === -2) nextStepId = -1;
  }

  if(nextStepId > -1 && steps[nextStepId].type.startsWith("ELSE")){
    if(steps[currentStepId].indent === steps[nextStepId].indent
      && (steps[currentStepId].type === "IF" 
        || steps[currentStepId].type === "ELSE_IF")
      ){
      // do nothing
    }else{
      // Must not point to ELSE_IF or ELSE
      nextStepId = findNextStep(steps,nextStepId,parentLoopId);
    }
  }
  return nextStepId;
}

function handleNormalStep(steps, stepId, links, loopStack) {
  const nextStepIndex = findNextStep(steps, stepId, parentLoop(loopStack));
  links[stepId].push(nextStepIndex);
}

function findLastStepOfSameLevel(steps, stepId){
  const targetLvl = steps[stepId].indent;
  for (let i = stepId-1; i > 0; i--) {
    if(targetLvl === steps[i].indent){
      return i; 
    }
  }
  throw new Error("Unable to find last step of same indent level");
}

function handleBranchStep(step, steps, links, stepId, loopStack) {
  if(step.type === "ELSE") { // no linking is needed
    delete links[stepId];
    return; 
  }
  const indent = step.indent;
  
  // a) Success branch: If the next step has a higher indent
  if (steps[stepId + 1] && steps[stepId + 1].indent > indent) {
    links[stepId].push(stepId + 1); // Success branch
  } else {
    links[stepId].push(undefined); // No success branch
  }

  // Find next step with same or lower indent
  let failingBranchStepId = findNextStep(steps, stepId, parentLoop(loopStack));
  if(steps[failingBranchStepId].type === "ELSE"){ //point to it's child step if exist
    links[stepId].push(failingBranchStepId+1);
  }else{
    links[stepId].push(failingBranchStepId);
  }

  if (step.type === "LOOP") {
    loopStack.push(stepId); // Push LOOP to the stack
  }
}

function handleGotoStep(steps, step, indexedSteps, links, stepId) {
  if(stepId === 0) throw new Error("GOTO can't be first step of the  flow");
  if(indexedSteps[step.msg] === undefined) throw new Error("GOTO is pointing to step.msg that doesn't specified with any step")

  //validate target step
  updateInLastStep(steps, links,stepId,indexedSteps[step.msg]);
}

function handleLeavingStep(steps, currentStepId, links, loopStack) {
  const step = steps[currentStepId];
  if (step.type === "SKIP") { // points to the LOOP step
    if (loopStack.length < 1) throw new Error("SKIP must be inside LOOP");

    const loopStepId = loopStack[loopStack.length - 1];
    updateInLastStep(steps, links, currentStepId, loopStepId);
  } else if (step.type === "STOP") { // points to next step of the LOOP step
    if (loopStack.length < 1) throw new Error("STOP must be inside LOOP");

    const nextStepIndex = findNextStep(steps, parentLoop(loopStack));
    console.log(currentStepId, nextStepIndex);
    updateInLastStep(steps, links, currentStepId, nextStepIndex);
  } else if (step.type === "END")  { // points to -1
    updateInLastStep(steps, links, currentStepId, -1);
  }
}

/**
 * Skip an extra link for leaving steps
 * @param {object} links 
 * @param {number} parentStepId 
 * @param {number} currentStepId 
 */
function updateInLastStep(steps, links, currentStepId, stepToPoint){
  let parentStepId = currentStepId - 1;
  if(steps[parentStepId].type === "ELSE"){
    parentStepId = findLastStepOfSameLevel(steps, parentStepId);
    console.log(parentStepId);
  }
  const ind = links[parentStepId].indexOf(currentStepId);
  links[parentStepId][ind] = stepToPoint;
  delete links[currentStepId];
}

function generateLinks(steps, indexedSteps, links) {
  const loopStack = []; // Stack to track LOOP steps

  // Traverse through all steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const indent = step.indent;

    if (loopStack.length > 0 ) {
      //pop until loop indent is equal to current  step indent
      for (let li = loopStack.length - 1; li > -1; li--) {
        const loopStepId = loopStack[li];
        if(indent <= steps[loopStepId].indent)
          loopStack.pop();
      }
    }

    if (step.type === "GOTO") {
      handleGotoStep(steps, step, indexedSteps, links, i);
      // continue;
    }else if (isBranchStep(step)) {
      handleBranchStep(step, steps, links, i, loopStack);
    }else if(isLeavingStep(step)){
      handleLeavingStep(steps, i, links, loopStack);
    }else{  // Normal Step: Just link to the next step if exists
      handleNormalStep(steps, i, links, loopStack);
    }

    
  }
}

function parentLoop(loopStack){
  return loopStack[loopStack.length -1];
}

module.exports = generateLinks
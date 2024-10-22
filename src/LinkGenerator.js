const branchSteps = ["IF", "ELSE_IF", "ELSE", "LOOP"];
const leavingSteps = ["GOTO", "SKIP", "STOP", "END"];

function isBranchStep(step) {
  return branchSteps.includes(step.type);
}
function isLeavingStep(step) {
  return leavingSteps.includes(step.type);
}

function handleGotoStep(step, indexedSteps, links, stepId) {
  if (indexedSteps[step.msg]) {
    links[stepId].push(indexedSteps[step.msg]);
  }
}

function findSuccessBranch(steps, currentIndex) {
  for (let i = currentIndex + 1; i < steps.length; i++) {
    if (steps[i].indent > steps[currentIndex].indent) {
      return i; // Return index of success branch (deeper indent)
    }
  }
  return undefined; // No success branch found
}

/**
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
 * @returns 
 */
function findNextStep(steps, currentStepId, parentLoopId) {

  let nextStepId = -2;

  if(parentLoopId && parentLoopId > currentStepId){
    const parentLoop = steps[parentLoopId];

    for (let i = currentStepId + 1; i < steps.length; i++) {
      if (steps[i].indent <= steps[currentStepId].indent &&
          steps[i].indent > parentLoop.indent) {
        nextStepId = i;
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

function handleBranchStep(step, steps, links, stepId, loopStack) {
  const indent = step.indent;
  
  // a) Success branch: If the next step has a higher indent
  if (steps[stepId + 1] && steps[stepId + 1].indent > indent) {
    links[stepId].push(stepId + 1); // Success branch
  } else {
    links[stepId].push(undefined); // No success branch
  }

  // Find next step with same or lower indent
  let failingBranch = findNextStep(steps, stepId, parentLoop(loopStack));
  links[stepId].push(failingBranch); // Failing branch, or undefined
}

function handleLeavingStep(steps, currentStepId, links, loopStack) {
  const step = steps[currentStepId];
  if (step.type === "SKIP") {
    // SKIP points to the LOOP step
    if (loopStack.length > 0) {
      const loopStepId = loopStack[loopStack.length - 1];
      links[currentStepId].push(loopStepId);
    } else {
      throw new Error("SKIP must be inside LOOP");
    }
  } else if (step.type === "STOP") {
    // STOP points to next step of the LOOP step
    const nextStepIndex = findNextStep(steps, parentLoop(loopStack));
    links[currentStepId].push(nextStepIndex);
  } else if (step.type === "END") {
    // END points to -1
    links[currentStepId].push(-1);
  }
}

function manageLoopStack(step, loopStack, indent, stepId, steps) {
  if (step.type === "LOOP") {
    loopStack.push(stepId); // Push LOOP to the stack
  }

  // Pop from stack if current indent is less than or equal to the last LOOP indent
  if (loopStack.length > 0 ) {
    const loopStepId = loopStack[loopStack.length - 1];
    if(stepId > loopStepId && indent <= steps[loopStepId].indent)
      loopStack.pop();
  }
}

function generateLinks(steps, indexedSteps, links) {
  const loopStack = []; // Stack to track LOOP steps

  // Traverse through all steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const indent = step.indent;

    manageLoopStack(step, loopStack, indent, i, steps);

    // GOTO Step
    if (step.type === "GOTO") {
      handleGotoStep(step, indexedSteps, links, i);
      continue;
    }

    // Branch Step (IF, ELSE_IF, LOOP)
    if (isBranchStep(step)) {
      handleBranchStep(step, steps, links, i, loopStack);
    }else if(isLeavingStep(step)){
      handleLeavingStep(steps, i, links, loopStack);
    }else{
      // Normal Step: Just link to the next step if it exists
      handleNormalStep(steps, i, links, loopStack);
    }
  }
}

function parentLoop(loopStack){
  return loopStack[loopStack.length -1];
}

module.exports = generateLinks
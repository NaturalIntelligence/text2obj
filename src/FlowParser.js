const {Step,Flow} = require("./Node");
const leavingSteps = ["SKIP","END","GOTO","STOP"];
const branchSteps = ["IF","ELSE","ELSE_IF","LOOP"];

class FlowParser {
  constructor() {
    this.flows = {};
    this.currentFlow = null;
    this.lineIndex = 0;
    this.lines = [];
    this.counter = 0;
    this.levelContext = [];
    this.pendingPointers = [];
  }

  parse(flowText) {
    this.lines = flowText.split('\n');
    this.parseFlow();
    return this.flows;
  }

  parseFlow() {
    console.log("reading flow");

    for (; this.lineIndex < this.lines.length; this.lineIndex++) {

      const line = this.lines[this.lineIndex];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines

      if (trimmedLine.startsWith('FLOW:')) {
        const flowName = trimmedLine.substring(6);
        console.log("flow", flowName);
        
        this.counter = 0;
        this.currentFlow = new Flow(flowName);
        this.flows[flowName] = this.currentFlow;
        this.lineIndex++; // Move to next line to process headers and statements
        this.parseHeaders(); // Parse headers
        const root = new Step("!", "!", -1);
        this.currentFlow.exitSteps = this.currentFlow.exitSteps.concat(this.parseSteps(root, -1)); // Start parsing with initial indent level
        this.currentFlow.steps = root.nextStep;
        this.resolvePendingPointers(this.currentFlow);
      }
    }
  }

  parseHeaders() {
    console.log("reading headers");

    while (this.lineIndex < this.lines.length) {
      const line = this.lines[this.lineIndex].trim();
      if (!line) {
        this.lineIndex++;
        continue; // Skip empty lines
      }

      if (line.startsWith('version:') || line.startsWith('threshold:')) {
        const [key, value] = line.split(':').map(part => part.trim());
        this.currentFlow.headers[key] = parseFloat(value) || value;
      } else {
        this.lineIndex--;
        break; // End of headers
      }
      this.lineIndex++;
    }
  }

  parseSteps(parentStep, parentIndentation) {
    // console.log("reading indentation: ", parentIndentation);

    let exitSteps = []; // to point next step in upper level
    let lastStep = null;      // to point next step in current level, to set  exitStep
    let currentStep = parentStep;   // for processing current step
    let endStep = null;   
    
    this.lineIndex++;
    for (; this.lineIndex < this.lines.length;this.lineIndex++) {
      const line = this.lines[this.lineIndex];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines
      
      const indentLevel = line.search(/\S/); // Find first non-space character
      lastStep = currentStep;
      if (trimmedLine.startsWith('FLOW:') || indentLevel <= parentIndentation) {
        this.lineIndex--; // Roll back to reprocess this line in the outer loop
        break;
      } 

      currentStep = this.createStep(trimmedLine);
      exitSteps = this.pointExitSteps(exitSteps, currentStep);

      if(isLeavingStep(currentStep.type)){
        this.updateForLeavingStep(parentStep, lastStep, currentStep);
        break;
      }else {
        if (isFirstStep(parentStep))
          parentStep.point(currentStep);
        else if (currentStep.isNot("ELSE")) // skip ELSE node from flow tree
          lastStep.point(currentStep);
        
        if(isBranchStep(currentStep.type)){
          let step = null;
          if(currentStep.is("ELSE_IF", "IF", "LOOP")){
            // TODO: validate if the lastStep was IF or ELSE_IF
            step = currentStep;
          }else if(currentStep.is("ELSE")){
            // TODO: validate if the lastStep was IF or ELSE_IF
            step = lastStep;
          }
          const lvlExitSteps = this.processLevel(step, indentLevel);
          exitSteps = this.handleExitSteps(lvlExitSteps,currentStep,exitSteps);
        }
      }
      endStep = currentStep
    }//End Loop
    // console.log("leaving indentation ", parentIndentation)
    if(!endStep || (!isLeavingStep(currentStep.type) && currentStep.type !== "ELSE")) exitSteps.push(endStep);
    return exitSteps;
  }

  /**
   * point Cumulated Exit Steps of last step level To Current Step
   * @param {string} stepType 
   * @param {Step[]} exitSteps 
   * @param {Step} currentStep 
   * @returns 
   */
  pointExitSteps(exitSteps, currentStep) {
    if (currentStep.type !== "ELSE_IF" && currentStep.type !== "ELSE") {
      //point all exitSteps to current Step
      exitSteps.forEach(step => {
        //END step sets as null so need  to exclude them
        if (step) step.point(currentStep);
      });
      exitSteps = [];
    }
    return exitSteps;
  }

  /**
   * Handle exit steps of nested level of current step
   * @param {Step[]} lvlExitSteps 
   * @param {Step} lvlStep 
   * @param {Step[]} exitSteps 
   * @returns 
   */
  handleExitSteps(lvlExitSteps,lvlStep, exitSteps){
    if (lvlExitSteps){
      if(lvlStep.type === "LOOP"){// exit step points to starting step
        lvlExitSteps.forEach(step => {
          // sometimes a step points to END. Hence, null.
          if (step) step.point(lvlStep);
        });
        return  exitSteps;
      }else{ // For IF,  ELSE_IF, ELSE: cumulate exit steps to point next step
        return exitSteps.concat(lvlExitSteps);
      }
    }
  }


  createStep(trimmedLine) {
    console.log(trimmedLine);
    const [stepType, stepMsg] = readStep(trimmedLine);
    const step = new Step(stepType, stepMsg, this.counter);
    if(!isLeavingStep(stepType))
      this.currentFlow.index[this.counter] = step;
    this.counter++;
    return step;
  }

  processLevel(currentStep, indentLevel) {
    this.levelContext.push(currentStep); //TODO: setting wrong for ELSE level
    const exitSteps = this.parseSteps(currentStep, indentLevel);
    this.levelContext.pop();
    return exitSteps;
  }

  findParentStep(stepType){
    console.log(this.levelContext);
    for(let i= this.levelContext.length - 1; i>-1; i--){
      if(this.levelContext[i].type === stepType) return this.levelContext[i];
    }
    throw new Error(`No parent ${stepType} found`);
  }

  /**
   * Update last step to skip current step
   * @param {Step} parentStep 
   * @param {Step} lastStep 
   * @param {Step} currentStep 
   */
  updateForLeavingStep(parentStep, lastStep, currentStep){
    // TODO: validate it is not first step of FLOW or LOOP

    if(currentStep.type === "SKIP") { // point current step to loop back
      this.sourceStep(parentStep, lastStep).point(this.findParentStep("LOOP"));
    }else if(currentStep.type === "END") { // point current step to null
      this.sourceStep(parentStep, lastStep).point(null);
      this.currentFlow.exitSteps.push(lastStep);
    }else if(currentStep.type === "GOTO") { // point current step to null
      const sStep = this.sourceStep(parentStep, lastStep);

      const targetStepIndex = currentStep.msg.match(/\d+/)[0]; // must not point to ELSE, SKIP, END, or GOTO statement
      this.pendingPointers.push([sStep.index, +targetStepIndex]);
      
      sStep.point(null);
      this.currentFlow.exitSteps.push(lastStep);
    }
    // TODO: validate no step after this
  }
  resolvePendingPointers(flow){
    this.pendingPointers.forEach(item => {
      const sourceStep = flow.index[item[0]];
      const targetStep = flow.index[item[1]];

      if(!targetStep) throw Error("Invalid target step");
      else sourceStep.nextStep[0] = targetStep;
    });
    this.pendingPointers = [];
  }
  
  sourceStep(parentStep, lastStep){
    if (isFirstStep(parentStep)) return parentStep;
    else return lastStep;
  }


  // End: Validation rules

}


function isFirstStep(step){
  return step.nextStep.length === 0;
}
function isLeavingStep(stepType){
  return leavingSteps.indexOf(stepType) !== -1;
}
function isBranchStep(stepType){
  return branchSteps.indexOf(stepType) !== -1;
}
function isSupportedKeyword(){
  return true;
}
function readStep(step) {
  const index = step.indexOf(' ');
  if(index < 1) return [step,""];
  else
    return [
      step.substring(0, index),
      step.substring(index + 1)
    ]
}

module.exports = FlowParser;
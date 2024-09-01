const {Step,Flow} = require("./Node");
const leavingSteps = ["SKIP","END","GOTO","STOP"];

class FlowParser {
  constructor() {
    this.flows = {};
    this.currentFlow = null;
    this.lineIndex = 0;
    this.lines = [];
    this.counter = 0;
    this.levelContext = [];
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
    console.log("reading indentation: ", parentIndentation);

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
      console.log(trimmedLine);

      const [stepType, stepMsg] = readStep(trimmedLine);

      currentStep = this.createStep(stepType, stepMsg);
      if(stepType === "END") {
        lastStep.point(null);
        this.currentFlow.exitSteps.push(lastStep);
        break;  // can be stored in this.currentFlow.exitSteps.push()
      }
      
      // if(!endStep) parentStep.point(currentStep);
      if(stepType !== "SKIP"){
        if(isFirstStep(parentStep)) 
          parentStep.point(currentStep);
        else if(stepType !== "ELSE" && stepType !== "SKIP") // skip ELSE node from flow tree
          lastStep.point(currentStep); // false branch
      }

      //point all exitSteps to current Step
      if(stepType !== "ELSE_IF" && stepType !== "ELSE"){
        exitSteps.forEach(step => {
          //END step sets as null so need  to exclude them
          if(step) step.point(currentStep);
        });
        exitSteps = [];
      }

      // process step
      if(stepType === "ELSE_IF"|| stepType === "IF" ){
        // TODO: validate if the lastStep was IF or ELSE_IF
        const lvlExitSteps = this.processLevel(currentStep, indentLevel);
        if(lvlExitSteps) exitSteps = exitSteps.concat(lvlExitSteps);
      }else if(stepType === "ELSE"){
        // TODO: validate if the lastStep was IF or ELSE_IF
        const lvlExitSteps = this.processLevel(lastStep, indentLevel);
        if (lvlExitSteps) exitSteps = exitSteps.concat(lvlExitSteps);
      }else if(stepType === "SKIP") { // point current step to loop back
        this.handleSkip(parentStep, lastStep);
        continue;
      }else if(stepType === "LOOP"){
        const lvlExitSteps = this.processLevel(currentStep, indentLevel);

        // exit step points to starting step
        if (lvlExitSteps) {
          lvlExitSteps.forEach(step => {
            // sometimes a step points to END. Hence, null.
            if (step) step.point(currentStep);
          });
        }
      }
      endStep = currentStep
    }//End Loop
    console.log("leaving indentation ", parentIndentation)
    if(!endStep || (!isLeavingStep(currentStep.type) && currentStep.type !== "ELSE")) exitSteps.push(endStep);
    return exitSteps;
  }

  handleSkip(parentStep, lastStep) {
    // TODO: validate currentStep.nextStep === []
    // TODO: validate SKIP is not first step of FLOW or LOOP
    const targetStep = this.findParentStep("LOOP");
    if (isFirstStep(parentStep)) parentStep.point(targetStep);
    else lastStep.point(targetStep);

    // validate no step after SKIP
  }

  createStep(stepType, stepMsg) {
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
}
function isFirstStep(step){
  return step.nextStep.length === 0;
}
function isLeavingStep(stepType){
  return leavingSteps.indexOf(stepType) !== -1;
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
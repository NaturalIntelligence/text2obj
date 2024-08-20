const {Step,Level,Flow} = require("./Node");

class FlowParser {
  constructor() {
    this.flows = {};
    this.currentFlow = null;
    this.lineIndex = 0;
    this.lines = [];
    this.counter = 0;
    this.stepContext = [];
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

        this.currentFlow.steps = this.parseSteps(-1); // Start parsing with initial indent level
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

  parseSteps(parentIndentation) {
    console.log("reading indentation: ", parentIndentation);

    let exitSteps = []; // to point next step in upper level
    let lastStep = null;      // to point next step in current level, to set  exitStep
    let currentStep = null;   // for processing current step
    let entryStep = null;     // to set entry step of current level
    
    this.lineIndex++;
    for (; this.lineIndex < this.lines.length;this.lineIndex++) {
      
      const line = this.lines[this.lineIndex];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines
      
      
      const indentLevel = line.search(/\S/); // Find first non-space character
      lastStep = currentStep;
      if (trimmedLine.startsWith('FLOW:')) {
        this.lineIndex--; // Roll back to reprocess this line in the outer loop
        break;
      }else if(indentLevel <= parentIndentation){
        this.lineIndex--;
        break; //this level is done
      } //else
      console.log(trimmedLine);

      const [stepType, stepMsg] = readStep(trimmedLine);

      if(stepType === "END") break;  // can be stored in this.currentFlow.exitSteps.push()
      
      // exchange pointers
      // using counter instead of line index so that
      //  - empty lines and multiple flows don't impact the index 
      currentStep = new Step(stepType, stepMsg, this.counter);
      this.currentFlow.index[this.counter] = currentStep; //To support GOTO
      this.counter++;

      if(lastStep) {
        if(stepType !== "ELSE") // skip ELSE node from flow tree
          lastStep.nextStep.push(currentStep); // false branch
      } else entryStep = currentStep;

      // process step
      if(stepType === "ELSE_IF"){
        this.stepContext.push(currentStep);
        const nestedSteps = this.parseSteps(indentLevel);
        currentStep.nextStep.push(nestedSteps.entryStep);
        if(nestedSteps.exitStep) exitSteps = exitSteps.concat(nestedSteps.exitStep);
      }else if(stepType === "ELSE"){
        // skip unnecessary ELSE step
        this.stepContext.push(currentStep);
        const nestedSteps = this.parseSteps(indentLevel);
        lastStep.nextStep.push(nestedSteps.entryStep);
        if(nestedSteps.exitStep) exitSteps = exitSteps.concat(nestedSteps.exitStep);
      }else{
        //point all nestedLastSteps to current Step
        exitSteps.forEach(step => {
          //to exclude END steps
          if(step) step.nextStep.push(currentStep);
        });
        exitSteps = [];

        if(stepType === "SKIP") { // point current node to loop back
          // TODO: validate currentStep.nextStep === []
          currentStep.nextStep.push(this.findParentStep("LOOP"));
          // if(lastStep) currentStep = lastStep; // skip SKIP node from flow tree
          continue;
        }else if(stepType === "IF"){
          this.stepContext.push(currentStep);
          const nestedSteps = this.parseSteps(indentLevel);
          currentStep.nextStep.push(nestedSteps.entryStep);
          if(nestedSteps.exitStep) exitSteps = exitSteps.concat(nestedSteps.exitStep);
        }else if(stepType === "LOOP"){
          // LOOP is a IF step where last step points to IF back
          this.stepContext.push(currentStep);
          const nestedSteps = this.parseSteps(indentLevel);
          currentStep.nextStep.push(nestedSteps.entryStep);
          if(nestedSteps.exitStep) {
            nestedSteps.exitStep.forEach(step => {
              //to exclude END steps
              if(step) step.nextStep.push(currentStep);
            });
          }
        }else if(stepType === "FOLLOW"){
          this.stepContext.push(currentStep);
          const flow = this.flows[stepMsg];
          if(!flow){
            //TODO: lazy loading
            throw Error("FLOW not found or not assigned yet: ", stepMsg);
          }else{
            //TODO
            // should we point to the flow or steps of the flow?
            // if pointing to the steps of the flow then
            // drawing current flow would become difficult
            const flowSteps = flow.steps;
            currentStep.nextStep.push(nestedSteps.entryStep);
            nestedSteps.exitStep = currentStep;
            exitSteps.concat(nestedSteps.exitStep);
          }
        }else if(!isSupportedKeyword(stepType)){
          throw Error(stepType, " is not supported");
        }
      }
    }//End Loop
    console.log("leaving indentation ", parentIndentation)
    this.stepContext.pop();
    //SKIP step is already set to point parent loop
    if(!currentStep || currentStep.type !== "SKIP") exitSteps.push(currentStep);
    return new Level( entryStep, exitSteps);
  }

  findParentStep(stepType){
    console.log(this.stepContext);
    for(let i= this.stepContext.length - 1; i>-1; i--){
      if(this.stepContext[i].type === stepType) return this.stepContext[i];
    }
    throw new Error(`No parent ${stepType} found`);
  }
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
const {Step,Level,Flow} = require("./Node");

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
      if (trimmedLine.startsWith('FLOW:') || indentLevel <= parentIndentation) {
        this.lineIndex--; // Roll back to reprocess this line in the outer loop
        break;
      } 
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
        if(stepType !== "ELSE" && stepType !== "SKIP") // skip ELSE node from flow tree
          lastStep.point(currentStep); // false branch

      } else entryStep = currentStep;

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
        const nestedSteps = this.processLevel(currentStep, indentLevel);
        if (nestedSteps.exitStep) exitSteps = exitSteps.concat(nestedSteps.exitStep);
      }else if(stepType === "ELSE"){
        // TODO: validate if the lastStep was IF or ELSE_IF
        const nestedSteps = this.processLevel(lastStep, indentLevel);
        if (nestedSteps.exitStep) exitSteps = exitSteps.concat(nestedSteps.exitStep);
      }else if(stepType === "SKIP") { // point current step to loop back
          // TODO: validate currentStep.nextStep === []
          // TODO: validate SKIP is not first step of FLOW or LOOP

          const targetStep = this.findParentStep("LOOP");
          if(lastStep) lastStep.point(targetStep);
          else currentStep.point(targetStep);

          // validate no step after SKIP
          continue;
      }else if(stepType === "LOOP"){
        const nestedSteps = this.processLevel(currentStep, indentLevel);

        // exit step points to starting step
        if (nestedSteps.exitStep) {
          nestedSteps.exitStep.forEach(step => {
            // sometimes a step points to END. Hence, null.
            if (step) step.point(currentStep);
          });
        }
      }
    }//End Loop
    console.log("leaving indentation ", parentIndentation)
    //SKIP step is already set to point parent loop
    if(!currentStep || (currentStep.type !== "SKIP" && currentStep.type !== "ELSE")) exitSteps.push(currentStep);
    return new Level( entryStep, exitSteps);
  }

  processLevel(currentStep, indentLevel) {
    this.levelContext.push(currentStep); //TODO: setting wrong for ELSE level
    const childLevel = this.parseSteps(indentLevel);
    if(childLevel.entryStep && childLevel.entryStep.type === "SKIP"){
      currentStep.point(childLevel.entryStep.nextStep[0]);  
    }else{
      currentStep.point(childLevel.entryStep);
    }
    this.levelContext.pop();
    return childLevel;
  }

  findParentStep(stepType){
    console.log(this.levelContext);
    for(let i= this.levelContext.length - 1; i>-1; i--){
      if(this.levelContext[i].type === stepType) return this.levelContext[i];
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
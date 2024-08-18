const {Step,Level,Flow} = require("./Node");

class FlowParser {
  constructor() {
    this.flows = {};
    this.currentFlow = null;
    this.lineIndex = 0;
    this.lines = [];
    this.counter = 0;
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

    let nestedLastSteps = []; // to point next step in upper level
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

      // exchange pointers
      currentStep = new Step(stepType, stepMsg, this.counter++);
      this.currentFlow.index[this.counter] = currentStep; //To support GOTO
      if(lastStep) {
        if(stepType !== "ELSE") 
          lastStep.nextStep.push(currentStep); // false branch
      }
      else entryStep = currentStep;

      // process step
      if(stepType === "ELSE_IF"){
        const nestedSteps = this.parseSteps(indentLevel);
        currentStep.nextStep.push(nestedSteps.entryStep);
        if(nestedSteps.exitStep) nestedLastSteps.push(nestedSteps.exitStep);
      }else if(stepType === "ELSE"){
        // skip unnecessary ELSE step 
        const nestedSteps = this.parseSteps(indentLevel);
        lastStep.nextStep.push(nestedSteps.entryStep);
        if(nestedSteps.exitStep) nestedLastSteps.push(nestedSteps.exitStep);
      }else{
        //point all nestedLastSteps to current Step
        nestedLastSteps.forEach(step => {
          console.log("settling: ",step.msg)
          console.log(currentStep.msg)
          step.nextStep.push(currentStep);
        });
        nestedLastSteps = [];

        if(stepType === "IF"){
          const nestedSteps = this.parseSteps(indentLevel);
          currentStep.nextStep.push(nestedSteps.entryStep);
          if(nestedSteps.exitStep) nestedLastSteps.push(nestedSteps.exitStep);
        }else if(stepType === "LOOP"){
          // LOOP is a IF step where last step points to IF back
          const nestedSteps = this.parseSteps(indentLevel);
          currentStep.nextStep.push(nestedSteps.entryStep);
          nestedSteps.exitStep = currentStep;
          if(nestedSteps.exitStep) nestedLastSteps.push(nestedSteps.exitStep);
        }else if(stepType === "END"){
          currentStep.nextStep = [];
          // For validation purpose, we can just step a flag and throw error if next statement is found
          break;
        }else if(stepType === "FOLLOW"){
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
            nestedLastSteps.push(nestedSteps.exitStep);
          }
        }else if(!isSupportedKeyword(stepType)){
          throw Error(stepType, " is not supported");
        }
      }
    }//End Loop
    console.log("leaving indentation ", parentIndentation)
    return new Level( entryStep, currentStep);
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
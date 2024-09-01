class Step {
  constructor(type, msg, index) {
    //some steps might not have any message
    if(msg) this.msg = msg.trim(); //TODO: remove data in parenthesis
    this.nextStep = [];    // every conditional block has 2 branch
    this.index = index;
    this.type = type;
  }

  point(node) {
    this.nextStep.push(node);
  }

  is(...type){
    return type.indexOf(this.type) !== -1
  }
  isNot(...type){
    return type.indexOf(this.type) === -1
  }
  trueSide(){ return this.nextStep[0]}
  falseSide(){ return this.nextStep[1]}
}

class Flow {
  constructor(name) {
    this.name = name;
    this.headers = {
      version: 1.0,
      threshold: 7000 // ms
    };
    this.steps = null; // Should point to start Node
    this.index = {};
    this.exitSteps = [];
  }
}

module.exports = {
  Step: Step,
  Flow: Flow
}
// Example usage

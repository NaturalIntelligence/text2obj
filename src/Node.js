class Step {
  constructor(type, msg, rawMsg, index) {
    //some steps might not have any message
    if(msg) this.msg = msg; //TODO: remove data in parenthesis
    if(rawMsg) this.rawMsg = rawMsg;
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
    this.headers = {};
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

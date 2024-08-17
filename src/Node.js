class Step {
  constructor(msg) {
    //some steps might not have any message
    if(msg) this.msg = msg.trim(); //TODO: remove data in parenthesis
    this.nextStep = [];    // every conditional block has 2 branch
  }

  addNextNode(node) {
    this.nextNodes.push(node);
  }
}

class Level {
  constructor(entryStep, exitStep) {
    this.entryStep = entryStep;
    this.exitStep = exitStep;
  }
}

class Flow {
  constructor(name) {
    this.name = name;
    this.headers = {
      version: 1.0,
      threshold: 7000 // ms
    };
    this.steps = null; // Should point to start Node
  }
}

module.exports = {
  Step: Step,
  Level: Level,
  Flow: Flow
}
// Example usage

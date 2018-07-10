export interface Stage {
  (next: () => any, done: () => any): any
}

export default class Pipeline {
  private stages: Stage[];
  private isRunning: boolean;
  private stageIndex: number;


  constructor(stages: Stage[]) {
    this.stages = stages;
    this.isRunning = false;
    this.stageIndex = 0;
  }

  public run() {
    this.internalRun();
  }

  private internalRun() {
    if (this.isRunning) {
      return;
    }

    this.stageIndex = 0;
    this.isRunning = true;

    this.next();
  }

  private next = () => {
    this.stages[this.stageIndex++](this.next, this.done);
  }

  private done = () => {
    this.isRunning = false;
  }
}

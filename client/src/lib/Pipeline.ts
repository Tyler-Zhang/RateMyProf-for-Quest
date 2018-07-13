export interface Stage {
  (next: () => any, done: (success?: boolean) => any): any
}

export default class Pipeline {
  private stages: Stage[];
  private isRunning: boolean;
  private stageIndex: number;
  private ranSuccessfully: boolean;

  /**
   * Should the pipeline just run successfully once
   */
  private canRunSuccessfullyMultipleTimes: boolean;


  constructor(stages: Stage[], canRunSuccessfullyMultipleTimes: boolean) {
    this.stages = stages;
    this.isRunning = false;
    this.stageIndex = 0;
    this.canRunSuccessfullyMultipleTimes = canRunSuccessfullyMultipleTimes;
  }

  public run = () => {
    if (!this.canRunSuccessfullyMultipleTimes && this.ranSuccessfully) {
      return;
    }
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
    if (this.stageIndex >= this.stages.length) {
      this.done(false);
      return;
    }

    this.stages[this.stageIndex++](this.next, this.done);
  }

  private done = (successful?: boolean) => {
    this.isRunning = false;

    if (successful) {
      this.ranSuccessfully = true;
    }
  }
}

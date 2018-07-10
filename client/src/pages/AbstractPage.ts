import * as $ from 'jquery';

export abstract class AbstractPage {
  _$: JQuery<HTMLElement>

  constructor() {
    this._$ = this.getMainContainer();
  }

  public run = async (next: () => any, done: () => any) => {
    if (this.isPageCorrect()) {
      await this.modifyPage();
      done();
      return;
    }

    next();
  }

  /**
   * Get a element so that we don't have to search the
   * entire dom tree each time
   */
  protected getMainContainer() {
    return $('body');
  }

  /**
   * Should check to see if we are on the correct page
   */
  protected abstract isPageCorrect(): boolean;

  /**
   *  Actually modify the page
   */
  protected abstract modifyPage(): void;
}

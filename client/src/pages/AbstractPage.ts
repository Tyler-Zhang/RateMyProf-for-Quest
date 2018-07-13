import * as $ from 'jquery';

export abstract class AbstractPage {
  _$: JQuery<HTMLElement>

  constructor() {
    this._$ = this.getMainContainer();
  }

  public run = async (next: () => any, done: (success: boolean) => any) => {
    if (this.isPageCorrect()) {
      await this.setup();
      await this.modifyPage();
      done(true);
      return;
    }

    next();
  }

  /**
   * Gets run before the modify page, allowing the class to set
   * up variables
   */
  protected setup() {
    return;
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
  protected isPageCorrect() {
    return this._$.find(`div#pt_pageinfo_win0[page="${this.pageInfoPageAttribute()}"]`).length > 0;
  };

  /**
   * Gets the page attribute that is used to represent the page on quest. It's an element
   * that looks like:
   *
   * <div id="pt_pageinfo_win0" page="SSR_CLSRCH_RSLT" component="CLASS_SEARCH" menu="SA_LEARNER_SERVICES" mode="CLASSIC"></div>
   */
  protected pageInfoPageAttribute() {
    return '';
  }

  /**
   *  Actually modify the page
   */
  protected abstract modifyPage(): void;
}

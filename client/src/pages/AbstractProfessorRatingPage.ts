import * as $ from 'jquery';
import { AbstractPage } from "./AbstractPage";
import { getReviews } from '../api';
import { Professor, ProfessorMetric } from '../models';

declare var chrome: any;

export abstract class AbstractProfessorRatingPage extends AbstractPage {
  container: JQuery<HTMLElement>

  constructor() {
    super();
    this.container = this.getMainContainer();
  }

  protected async modifyPage() {
    /**
     * Do before querying
     */
    this.insertTableHeadings();
    this.insertProfMetricNodes();
    this.addClassToTableRows('wqp-prof-row');

    const professors = this.getProfessorsOnPage();
    const ratings = await getReviews(professors);

    this.populateProfMetricNodes(ratings);
  }

  /**
   * Should insert the table headings onto the page
   */
  protected abstract insertTableHeadings(): void;

  /**
   * Should insert cells in the html using create data nodes
   */
  protected abstract insertProfMetricNodes(): void;

  /**
   * Should return a string of all the professor names on the page
   */
  protected abstract getProfessorsOnPage(): string[];

  /**
   * Should populate all of the data nodes
   */
  protected abstract populateProfMetricNodes(professors: Professor[]): void;

  /**
   * Tag professor rows with 'wqp-professor-row' so that we can easily reference them
   */
  protected abstract addClassToTableRows(className: string): void;
  /**
   * Creates the actual table data nodes that will eventually be populated
   * with the scores for the professor
   */
  protected createProfMetricNodes(template: JQuery<HTMLElement>, additionalProps: Record<string, string> = {}) {
    return $.map(this.metrics, (heading) => (
      template.clone().attr({
        'wqp-type': heading.key,
        ...additionalProps
      })
      .html('--')
      .addClass('wqp-rating')
    ));
  }

  /**
   * Creates the headings, we copy the style of the existing table headings
   */
  protected createHeadingNodes(template: JQuery<HTMLElement>) {
    return this.metrics.map((heading) => (
      template.clone()
        .html(heading.name)
        .addClass('wqp-heading')
    ));
  }

  /**
   * Creates a link object to suggest a rmp link for the professor
   */
  protected createSuggestLink(name: string) {
    return $('<a>', {
      title: `Suggest a link for ${name}`,
      href: 'javascript:void(0)'
    })
    .click(() => this.onSuggestLinkClick(name))
    .addClass('wqp-suggest-link');
  }

  protected onSuggestLinkClick(name: string) {
    chrome.runtime.sendMessage({ name, message: 'openSuggestionPage' })
  }

  /**
   * Creates a view on Rate My Professor link
   */
  protected createViewLink(url: string) {
    return $('<a>')
      .prop({ href: url, 'alt-text': 'View on Rate My Professor', target: '_blank' })
  }

  protected get metrics (): ProfessorMetric[] {
    return  [
      {
        name: 'Quality',
        desc: 'How generally awesome the professor is',
        key: 'quality',
        colored: true,
        colorInverted: false,
        decimal: true
      },
      {
        name: 'Difficulty',
        desc: 'How easy the professor is ',
        key: 'easiness',
        colored: true,
        colorInverted: true,
        offset: 1.3,
        decimal: true
      },
      {
        name: 'Reviews',
        desc: 'How many people have reviewed the professor',
        colored: false,
        key: 'count',
        decimal: false
      }
    ]
  }
}

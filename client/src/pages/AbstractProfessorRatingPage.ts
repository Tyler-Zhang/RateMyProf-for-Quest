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
    this.insertTableHeadings();
    this.insertProfMetricNodes();

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
   * Creates the actual table data nodes that will eventually be populated
   * with the scores for the professor
   */
  protected createProfMetricNodes(additionalProps: Record<string, string> = {}) {
    return $.map(this.metrics, (heading) => (
      $('<td>').attr({
        style: 'background-color:white; border-style:solid; border-width:1',
        'wqp-metric': heading.key,
        ...additionalProps
      }).html('--')
    ));
  }

  /**
   * Creates the headings, we copy the style of the existing table headings
   */
  protected createHeadingNodes(template: JQuery<HTMLElement>) {
    return this.metrics.map((heading) => (
      template.clone()
        .attr('width', 60)
        .html(heading.name)
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
    .click(() => this.onSuggestLinkClick(name));
  }

  protected onSuggestLinkClick (name: string) {
    chrome.runtime.sendMessage({ name, message: 'openSuggest' })
  }

  protected get metrics (): ProfessorMetric[] {
    return  [
      {
        name: 'Quality',
        desc: 'How generally awesome the professor is',
        key: 'quality',
        colored: true,
        colored_inverted: false,
        offset: 0,
        decimal: true
      },
      {
        name: 'Difficulty',
        desc: 'How easy the professor is ',
        key: 'easiness',
        colored: true,
        colored_inverted: true,
        offset: 1.5,
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

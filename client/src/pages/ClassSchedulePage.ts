import { uniq, lowerCase } from 'lodash';
import * as $ from 'jquery';
import { AbstractProfessorRatingPage } from './AbstractProfessorRatingPage';
import { Professor } from '../models';
import { calculateGrade } from '../utils';

export class ClassSchedulePage extends AbstractProfessorRatingPage {
  private teacherRows: JQuery<HTMLElement>;

  protected pageInfoPageAttribute() {
    return 'SSR_SSENRL_LIST';
  }

  protected setup() {
    this.teacherRows = this._$.find('tr[id^="trCLASS_MTG_VW"]');
  }

  protected insertTableHeadings() {
    const instructorHeadings = this.getInstructorHeadings();
    const headings = this.createHeadingNodes(instructorHeadings.first());

    instructorHeadings.after(headings);
  }

  protected insertProfMetricNodes() {
    const that = this;
    const instructorNodes = this.getInstructorNodes();

    instructorNodes.each(function() {
      const teacherName = lowerCase($(this).text());
      const metricNodes = that.createProfMetricNodes(instructorNodes.first(), { 'wqp-name': teacherName });
      $(this).after(metricNodes);

      // Have to wrap children because the parent element
      // Keeps getting reset
      $(this).children().attr({
        'wqp-type': 'name',
        'wqp-name': teacherName
      });
    });
  }

  protected getProfessorsOnPage() {
    const allNames = this.teacherRows.find('span[id^="DERIVED_CLS_DTL_SSR_INSTR_LONG"]')
      .toArray()
      .map((dom) => lowerCase(dom.innerHTML))

    return uniq(allNames) as string[];
  }

  protected populateProfMetricNodes(professors: Professor[]) {
    for(const professor of professors) {
      if (professor.name === 'staff') {
        continue;
      }

      if (professor.isMissing) {
        // Add a link for them to suggest a rate my prof link
        this._$.find(`div[wqp-type="name"][wqp-name="${professor.name}"]`)
          .wrap(this.createSuggestLink(professor.name));

        continue;
      }

      for(const metric of this.metrics) {
        const val = professor[metric.key];
        this._$.find(`td[wqp-type="${metric.key}"][wqp-name="${professor.name}"]`)
          .html(val)
          .addClass(metric.colored ? calculateGrade(val, 5, { inverted: metric.colored_inverted }) : '');

        this._$.find(`div[wqp-type="name"][wqp-name="${professor.name}"]`).wrap(this.createViewLink(professor.url));
      }
    }
  }

  protected addClassToTableRows(className: string) {
    this.teacherRows.addClass(className)
  }

  private getInstructorHeadings() {
    return this._$.find('th[abbr="Instructor"]');
  }

  private getInstructorNodes() {
    return this._$.find('div[id^="win0divDERIVED_CLS_DTL_SSR_INSTR_LONG"]').parent();
  }
}

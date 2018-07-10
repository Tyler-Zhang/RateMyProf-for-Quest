import { uniq, lowerCase } from 'lodash';
import { AbstractProfessorRatingPage } from './AbstractProfessorRatingPage';
import { Professor } from '../models';
import { calculateColor } from '../utils';

export class ClassSearchPage extends AbstractProfessorRatingPage {
  private teacherRows: JQuery<HTMLElement>;

  protected isPageCorrect() {
    this.teacherRows = this._$.find('tr[id^="trSSR_CLSRCH_MTG1"]');
    return this.teacherRows.length > 0;
  }

  protected insertTableHeadings() {
    const instructorHeadings = this.getInstructorHeadings();
    const headings = this.createHeadingNodes(instructorHeadings.first());

    instructorHeadings.after(headings);
  }

  protected insertProfMetricNodes() {
    const that = this;

    this.getInstructorNodes().each(function() {
      const teacherName = lowerCase($(this).text());
      const metricNodes = that.createProfMetricNodes({ 'wqp-name': teacherName });
      $(this).after(metricNodes);

      // Also tag the name
      $(this).prop({
        'wqp-type': 'name',
        'wqp-name': teacherName
      })
    })
  }

  protected getProfessorsOnPage() {
    const allNames = this.teacherRows.find('span[id^="MTG_INSTR"]')
      .map((index, dom) => dom.innerHTML)
      .map(lowerCase as any) as any;

    return uniq(allNames) as string[];
  }

  protected populateProfMetricNodes(professors: Professor[]) {
    const metrics = this.metrics;

    for(const professor of professors) {
      if (professor.name === 'staff') {
        return;
      }

      if (professor.isMissing) {
        // Add a link for them to suggest a rate my prof link
        $(`td[wqp-type="name"][wqp-name="${professor.name}"`)
          .children()
          .wrap(this.createSuggestLink(professor.name));

        continue;
      }

      for(const metric of metrics) {
        const val = professor[metric.key];

        $(`td[wqp-type="${metric.key}"][wqp-name="${professor.name}"]`)
          .html(val)
          .css({
            'background-color': metric.colored ? calculateColor(val, 5, { inverted: metric.colored_inverted }) : 'white'
          });
      }
    }
  }

  private getInstructorHeadings() {
    return this._$.find('th[abbr="Instructor"]');
  }

  private getInstructorNodes() {
    return this._$.find('div[id^="win0divMTG_INSTR"]').parent();
  }
}

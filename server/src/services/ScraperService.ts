import { Service } from 'typedi';
import Scraper, { PersonObject } from '../lib/Scraper';
import { Professor, University } from '../models';

@Service()
export class ScraperService {
  private scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
  }

  public async getProfessorByName(university: University, name: string) {
    const professor = await this.convertFromScraperPromise(this.scraper.getDataByName(university.name, name));

    if (professor) {
      return professor;
    }

    const missingProf = new Professor();
    missingProf.isMissing = true;
    missingProf.name = name;

    return missingProf;
  }

  public getProfessorById(id: number) {
    return this.convertFromScraperPromise(this.scraper.getDataById(id));
  }

  public getProfessorByLink(url: string) {
    return this.convertFromScraperPromise(this.scraper.getDataByUrl(url));
  }

  private async convertFromScraperPromise(promise: Promise<PersonObject | null>) {
    try {
      const result = await promise;

      if (!result) {
        return null;
      }

      const professor = new Professor();
      professor.count = result.count;
      professor.department = result.department;
      professor.easiness = result.easiness;
      professor.resourceId = result.id;
      professor.isMissing = false;
      professor.quality = result.quality;
      professor.name = result.name;
      professor.url = result.url;
      professor.retake = result.retake;

      return professor;
    } catch (e) {
      return null;
    }
  }
}

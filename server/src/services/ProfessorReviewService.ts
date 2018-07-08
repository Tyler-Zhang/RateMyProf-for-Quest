import { Service, Inject } from 'typedi';
import { NotFoundError } from '../errors';
import { School, Professor } from '../models';
import { ScraperService } from './ScraperService';

@Service()
export class ProfessorReviewService {
  @Inject()
  scraperService: ScraperService

  async getReviews (schoolName: string, professorNames: string[]) {
    const school = await School.findOne({
      where: { name: schoolName }
    });

    if (!school) {
      throw new NotFoundError(`The school ${schoolName} is not supported`);
    }

    professorNames = professorNames.map(name => name.toLowerCase());

    const existingProfessors = await Professor.createQueryBuilder('professor')
      .where('professor.name IN (:...professorNames)', { professorNames })
      .getMany();

    if (existingProfessors.length === professorNames.length) {
      // We found them all
      return existingProfessors;
    }

    // Figure out which names are missing and scrape those
    const resolvedNamesHashmap = {};
    existingProfessors.forEach((professor) => { resolvedNamesHashmap[professor.name] = true });
    const unresolvedNames = professorNames.filter((name) => !resolvedNamesHashmap[name]);

    // Resolve the missing profs
    const resolvedProfs = await Promise.all(unresolvedNames.map(async name => {
      const scraped = await this.scraperService.getProfessorByName(school, name)
      scraped.name = name; // Override the name to what we were searching for
      scraped.school = school;
      return scraped;
    }));

    // Save the resolved profs
    await resolvedProfs.map(prof => prof.save());

    return existingProfessors.concat(resolvedProfs);
  }
}

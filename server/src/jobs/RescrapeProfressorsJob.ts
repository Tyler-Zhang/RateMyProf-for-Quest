import { Inject, Service } from 'typedi';
import { ScraperService } from '../services/ScraperService';
import { rescrapeConfig } from '../config';
import { Professor } from '../models';
import { log } from '../config';

@Service()
export class RescrapeProfessorsJob {
  @Inject()
  scraperService: ScraperService;

  private scrapeInProgress: boolean;
  private currentIndex: number;

  constructor() {
    this.scrapeInProgress = false;
  }

  public async run() {
    if (this.scrapeInProgress) {
      return; // Don't want to scrape concurrently
    }

    this.scrapeInProgress = true;
    this.currentIndex = 0;

    log.info('Starting rescrape');

    let batch = await this.getNextBatch();

    while(batch.length) {
      log.info(`Rescraped ${this.currentIndex} records`);

      await Promise.all(batch.map(this.rescrapeRecord));
      batch = await this.getNextBatch();
    }

    log.info('Rescrape done.');
    this.scrapeInProgress = false;
  }

  private rescrapeRecord = async (professor: Professor) => {
    let newProfessor: Professor | null;

    if (professor.isMissing) {
      newProfessor = await this.scraperService.getProfessorByName(professor.school, professor.name);
    } else {
      newProfessor = await this.scraperService.getProfessorById(professor.resourceId as any);
    }

    if (newProfessor === null || newProfessor.isMissing) {
      return;
    }

    professor.isMissing = false;
    professor.count = newProfessor.count;
    professor.easiness = newProfessor.easiness;
    professor.quality = newProfessor.quality;

    return professor.save();
  }

  private async getNextBatch() {
    const result = await Professor.find({
      skip: this.currentIndex,
      take: rescrapeConfig.batchSize,
      relations: ['school']
    } as any);

    this.currentIndex += rescrapeConfig.batchSize;

    return result;
  }
}

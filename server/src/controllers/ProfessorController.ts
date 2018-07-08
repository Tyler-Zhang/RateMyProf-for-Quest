import { Controller, Body, Get, Post, UseAfter } from "routing-controllers";
import { ProfessorReviewRequest } from "../requests";
import { ProfessorReviewService } from "../services/ProfessorReviewService";
import { Inject } from "typedi";
import { classToPlain } from 'class-transformer';

@Controller('/professors')
export class ProfessorController {

  @Inject()
  professorReviewService: ProfessorReviewService;

  @Post('/reviews')
  async getProfessorReviews(@Body({ validate: true }) body: ProfessorReviewRequest) {
    const professors = await this.professorReviewService.getReviews(body.school, body.names);
    return classToPlain(professors, { groups: ['client'] });
  }
}

import { Controller, Body, Get, Post } from "routing-controllers";
import { ProfessorReviewRequest } from "../requests";
import { ProfessorReviewService } from "../services/ProfessorReviewService";
import { Inject } from "typedi";

@Controller('/professors')
export class ProfessorController {

  @Inject()
  professorReviewService: ProfessorReviewService;

  @Post('/reviews')
  getProfessorReviews(@Body({ validate: true }) body: any) {
    console.log(body);
    return this.professorReviewService.getReviews(body.university, body.names);
  }
}

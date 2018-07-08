import { Controller, Body, Get } from "routing-controllers";
import { ProfessorReviewRequest } from "../requests";

@Controller('/professors')
export class ProfessorController {

  @Get('/reviews')
  getProfessorReviews(@Body({ validate: true }) body: ProfessorReviewRequest) {
  }
}

import { Controller, Body, Post } from "routing-controllers";
import { Suggestion } from "../models";

@Controller('/suggestions')
export class SuggestionController {
  @Post('')
  async createSuggestion(@Body({ validate: true }) body: Suggestion) {
    return body.save();
  }
}

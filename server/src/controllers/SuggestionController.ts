import { Controller, Body, Post, NotFoundError } from "routing-controllers";
import { SuggestionRequest } from "../requests";
import { School, Suggestion } from "../models";

@Controller('/suggestions')
export class SuggestionController {
  @Post('')
  async createSuggestion(@Body({ validate: true }) body: SuggestionRequest) {
    const school = await School.findOne({ where: { name: body.school }});

    if (!school) {
      throw new NotFoundError('That school is invalid');
    }

    const suggestion = new Suggestion();
    suggestion.name = body.name;
    suggestion.url = body.url;
    suggestion.school = school;

    suggestion.save();
  }
}

import { IsString, IsUrl} from 'class-validator';

export class SuggestionRequest {
  @IsString()
  school: string;

  @IsString()
  name: string;

  @IsUrl()
  url: string;
}

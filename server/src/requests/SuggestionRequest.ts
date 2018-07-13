import { IsString, IsArray, IsUrl} from 'class-validator';

export class ProfessorReviewRequest {
  @IsString()
  school: string;

  @IsString()
  name: string;

  @IsUrl()
  url: string;
}

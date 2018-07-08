import { IsString, IsArray} from 'class-validator';

export class ProfessorReviewRequest {
  @IsString()
  school: string;

  @IsArray()
  names: string[];
}

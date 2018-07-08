import { IsString, IsArray} from 'class-validator';

export class ProfessorReviewRequest {
  @IsString()
  university: string;

  @IsArray()
  names: string[];
}

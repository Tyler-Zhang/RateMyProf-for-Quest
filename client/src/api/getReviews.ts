import { apiConfig } from '../config';
import { stringify } from 'querystring';
import { Professor } from '../models';

export async function getReviews (names: string[]) {
  const body = {
    school: apiConfig.school,
    names
  };

  const encodedBody = stringify(body);

  const request = await fetch(apiConfig.professorReviewUrl, {
    body: encodedBody,
    headers: {
      'Content-type': 'x-www-form-urlencoded'
    },
    method: 'POST'
  });

  return await request.json() as Professor[];
}

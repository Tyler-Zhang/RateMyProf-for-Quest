import * as $ from 'jquery';
import { apiConfig } from '../config';
import { Professor } from '../models';

export async function getReviews (names: string[]) {
  const body = {
    school: apiConfig.school,
    names
  };

  const encodedBody = $.param(body);

  const request = await fetch(apiConfig.professorReviewUrl, {
    body: encodedBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  });

  return await request.json() as Professor[];
}

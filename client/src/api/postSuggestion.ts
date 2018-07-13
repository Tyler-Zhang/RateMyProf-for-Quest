import * as $ from 'jquery';
import { apiConfig } from '../config';

export async function postSuggestion (name: string, url: string) {
  const body = {
    school: apiConfig.school,
    name,
    url
  };

  const encodedBody = $.param(body);

  await fetch(apiConfig.suggestionURL, {
    body: encodedBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  });
}

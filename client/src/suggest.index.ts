import * as $ from 'jquery';
import { capitalize, split, join, map } from 'lodash';
import { postSuggestion } from './api/postSuggestion';

/**
 * Get name and university from the url
 */
const urlParams = new URLSearchParams(window.location.search);

const name = urlParams.get('name');
const school = urlParams.get('university');

const pascalCase = (str: string) => join(map(split(str, ' '), capitalize), ' ');

$('#profName').text(pascalCase(name as string));
$('#universityName').text(pascalCase(school as string));

$('#submit').click(submitSuggestion);

async function submitSuggestion() {
  const url = $('#url').val();

  if (!name || !url) {
    alert('Seems like this link is not working, try again later :)');
    return;
  }

  const rateMyProfessorRegex = /^https?:\/\/www.ratemyprofessors.com\/ShowRatings.jsp\?tid=\d+$/;

  if (!rateMyProfessorRegex.test(url as string)) {
    alert('The url is not valid');
    return;
  }

  await postSuggestion(name, url as string);
}

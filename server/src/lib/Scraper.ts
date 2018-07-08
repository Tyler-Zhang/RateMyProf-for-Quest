import * as cheerio from 'cheerio';
import * as _ from 'lodash';
import axios from 'axios';
import attempt from './attempt';
import removeExtraWhitespace from './removeExtraWhitespace';

const BASE_URL = "https://www.ratemyprofessors.com"
const SEARCH_URL = `${BASE_URL}/search.jsp?queryBy=teacherName`;

/**
 * The data object returned by the scraper
 */
export interface PersonObject {
  quality: number | null;
  retake: number | null;
  easiness: number | null;
  count: number | null;
  name: string;
  id: number | null;
  url: string | null;
  university: string | null;
  department: string | null;
}

export default class Scraper {
  /**
   * Scrapes data by the name of the professor
   */
  public async getDataByName(university: string, name: string): Promise<PersonObject | null> {
    const url = `${SEARCH_URL}&schoolName=${encodeURIComponent(university)}&query=${encodeURIComponent(name)}`;
    const request = await axios.get(url);

    /**
     * We are requesting for a serach page, we have to try to extract the link
     * from the search results
     */
     const $ = cheerio.load(request.data);
     const professorUrl = $("li.listing.PROFESSOR").find("a").attr("href");

     if (!professorUrl) {
       return null;
     }

     return this.getDataByUrl(professorUrl);
  }

  /**
   * Scrapes data based on the id of the professor
   */
  public getDataById(id: number): Promise<PersonObject | null> {
    const url = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + id;
    return this.getDataByUrl(url);
  }

  /**
   * Scrapes data from a specific link
   */
  public async getDataByUrl(url: string): Promise<PersonObject | null> {
    const request = await axios.get(url);

    return this.scrapeData(request.data);
  }

  private scrapeData(html: string): PersonObject | null {
    let $ = cheerio.load(html);

    /** One of those weird professors where no information is found */
    if ($(".dosanddonts").length != 0) {
      return null;
    }

    let scoreWrapper = $(".breakdown-wrapper");
    let breakdownSection = scoreWrapper.find(".breakdown-section");
    let quality = (scoreWrapper.find("div.breakdown-container").find("div.grade").html() as string).trim();

    let retake = attempt(null, () => Number(breakdownSection.eq(0).children().html()));
    let difficulty = attempt(null, () => Number(breakdownSection.eq(1).children().html()));
    let ratingCount = attempt(null, () => _.parseInt($(".table-toggle.rating-count.active").html() as string));
    let name = removeExtraWhitespace($(".profname").text());
    let university = attempt(null, () => $(".school").html());

    let department = $(".result-title").clone().children().remove().end().text().trim();

    let url = $("meta[property='og:url']").attr("content");

    let personObject: PersonObject = {
      name,
      quality: Number(quality),
      retake,
      easiness: Number(difficulty),
      count: ratingCount,
      url,
      id: extractIdFromUrl(url),
      university,
      department: extractDepartment(department)
    }

    return personObject;
  }
}

const idRegex = /ShowRatings.jsp\?tid=(\d+)$/;
/**
 * extracts the id number of the professor from the url on the page
 */
function extractIdFromUrl(url: string): number | null {
  const result = url.match(idRegex);
  if (!result || result.length < 2) {
    console.log("malformed id");
    return null;
  } else
    return Number(result[1]);
}


const departmentRegex = /Professor in the (.+) department/i;
/**
 * extracts the department of the professor from the description
 */
function extractDepartment(title: string): string | null {
  const result = title.match(departmentRegex);
  if (!result || result.length < 2) {
    console.log("malformed description");
    return null;
  }
  else
    return result[1];
}

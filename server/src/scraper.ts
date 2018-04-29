import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

//const baseUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+waterloo&query=ryan+trelford";
const baseUrl = "https://www.ratemyprofessors.com"
const queryUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName";

export class Scraper {
  uniUrl: string;

  constructor(school: string) {
    this.uniUrl = queryUrl + "&schoolName=" + encodeURIComponent(school);
  }

  /**
   * Scrapes data by the name of the professor
   */
  getDataByName(name: string): Promise<PersonObject | null> {
    let webUrl = this.uniUrl + "&query=" + encodeURIComponent(name);
    return fetch(webUrl).then(d => d.text())
      .then(d => {
        let $ = cheerio.load(d);
        let profUrl = $("li.listing.PROFESSOR").find("a").attr("href");
        if (!profUrl)
          return null;
        else
          return fetch(baseUrl + profUrl).then(r => r.text()).then(this.scrapeData);
      }).catch(e => {
        console.log(e);
        return null;
      })
  }

  /**
   * Scrapes data based on the id of the professor
   */
  getDataById(id: number): Promise<PersonObject | null> {
    let url = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + id;
    return fetch(url).then(d => d.text())
      .then(this.scrapeData)
      .catch(e => {
        console.log(e);
        return null;
      })
  }

  /**
   * Scrapes data from a specific link
   */
  getDataByLink(url: string): Promise<PersonObject | null> {
    return fetch(url).then(d => d.text())
      .then(this.scrapeData)
      .catch(e => {
        console.log(e);
        return null;
      })
  }

  private scrapeData(html: string): PersonObject | null {
    let $ = cheerio.load(html);

    /** One of those weird professors where no information is found */
    if ($(".dosanddonts").length != 0) {
      return null;
    }

    const returnNullOnError = (func: () => any) => {
      try {
        let val = func()
        return val
      } catch (e) {
        return null
      }
    }

    let scoreWrapper = $(".breakdown-wrapper");
    let quality = returnNullOnError(() => (scoreWrapper.find("div.breakdown-container").find("div.grade").html() as string).trim())

    let breakdownSection = returnNullOnError(() => scoreWrapper.find(".breakdown-section"))
    let difficulty = returnNullOnError(() => (breakdownSection.eq(1).children().html() as string).trim())
    let chilli = returnNullOnError(() =>  breakdownSection.eq(2).find("img").attr("src"))
    let ratingCount = returnNullOnError(() => ($(".table-toggle.rating-count.active").html() as string).trim())
    let nameWrapper = returnNullOnError(() => $(".profname").children())
    let university = returnNullOnError(() => $(".school").html())

    let department = returnNullOnError(() => $(".result-title").clone().children().remove().end().text().trim())

    let fname = returnNullOnError(() => nameWrapper.eq(0).html().trim())
    let mname = returnNullOnError(() => nameWrapper.eq(1).html().trim())
    let lname = returnNullOnError(() => nameWrapper.eq(2).html().trim())

    let url = $("meta[property='og:url']").attr("content");

    let rtnObj: PersonObject = {
      fname,
      mname,
      lname,
      quality: Number(quality),
      easiness: Number(difficulty),
      chilli,
      count: extractRatingAmount(ratingCount),
      url,
      id: extractIdFromUrl(url),
      university,
      department: extractDepartment(department)
    }

    return rtnObj;
  }
}


let ratingRegex = /^\d+/;
/**
 * extracts the amount of ratings from a string
 * eg. extracts 18 from "18 Student Ratings"
 */
function extractRatingAmount(rating: string): number | null {
  let result = rating.match(ratingRegex);
  if (!result || result.length != 1) {
    console.log("malformed rating");
    return null;
  } else
    return Number(result[0]);
}


let idRegex = /ShowRatings.jsp\?tid=(\d+)$/;
/**
 * extracts the id number of the professor from the url on the page
 */
function extractIdFromUrl(url: string): number | null {
  let result = url.match(idRegex);
  if (!result || result.length < 2) {
    console.log("malformed id");
    return null;
  } else
    return Number(result[1]);
}


let departmentRegex = /Professor in the (.+) department/i;
/**
 * extracts the department of the professor from the description
 */
function extractDepartment(title: string): string | null {
  let result = title.match(departmentRegex);
  if (!result || result.length < 2) {
    console.log("malformed description");
    return null;
  }
  else
    return result[1];
}

/**
 * The data object returned by the scraper
 */
export interface PersonObject {
  quality: number | null;
  easiness: number | null;
  chilli: string,
  count: number | null;
  fname: string | null;
  lname: string | null;
  mname: string | null;
  id: number | null;
  url: string | null;
  university: string | null;
  department: string | null;
}
/*
let testScraper = new Scraper("University of Waterloo");
testScraper.getDataByName("Ryan Trelford").then(v => console.log(v));
*/

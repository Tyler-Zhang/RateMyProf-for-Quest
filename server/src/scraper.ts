import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

//const baseUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+waterloo&query=ryan+trelford";
const baseUrl = "https://www.ratemyprofessors.com"
const queryUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName";

export class Scraper{
    uniUrl: string;

    constructor(school: string){
        this.uniUrl = queryUrl + "&schoolName=" + encodeURIComponent(school);
    }
    
    /**
     * Scrapes data by the name of the professor
     */
    getDataByName(name: string): Promise<PersonObject>{
        let webUrl = this.uniUrl + "&query=" + encodeURIComponent(name);
        return fetch(webUrl).then(d =>  d.text())
        .then(d => {
            let $ = cheerio.load(d);
            let profUrl = $("li.listing.PROFESSOR").find("a").attr("href");
            if(!profUrl)
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
    getDataById(id: number): Promise<PersonObject>{
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
    getDataByLink(url: string): Promise<PersonObject>{
        return fetch(url).then(d => d.text())
        .then(this.scrapeData)
        .catch(e => {
            console.log(e);
            return null;
        })
    }

    private scrapeData(html:string): PersonObject{
        let $ = cheerio.load(html);

         /** One of those weird professors where no information is found */
        if($(".dosanddonts").length != 0){
            return null;
        }

        let scoreWrapper = $(".breakdown-wrapper");
        let quality = scoreWrapper.find("div.breakdown-container").find("div.grade").html().trim();

        let breakdownSection = scoreWrapper.find(".breakdown-section");
        let retake = breakdownSection.eq(0).children().html().trim();
        let difficulty = breakdownSection.eq(1).children().html().trim();
        let chilli = breakdownSection.eq(2).find("img").attr("src");
        let ratingCount = $(".table-toggle.rating-count.active").html().trim();
        let nameWrapper = $(".profname").children();
        let university = $(".school").html();

        let department = $(".result-title").clone().children().remove().end().text().trim();

        let url = $("meta[property='og:url']").attr("content");

        let rtnObj:PersonObject = {
            fname: nameWrapper.eq(0).html().trim(),
            mname: nameWrapper.eq(1).html().trim(),
            lname: nameWrapper.eq(2).html().trim(),
            quality: Number(quality),
            retake,
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
function extractRatingAmount(rating:string): number{
    let result = rating.match(ratingRegex);
    if(!result || result.length != 1){
        console.log("malformed rating");
        return null;
    }else
        return Number(result[0]);
}

let idRegex = /ShowRatings.jsp\?tid=(\d+)$/;
/**
 * extracts the id number of the professor from the url on the page
 */
function extractIdFromUrl(url: string): number{
    let result = url.match(idRegex);
    if(!result || result.length < 2){
        console.log("malformed id");
        return null;
    }else
        return Number(result[1]);
}

let departmentRegex = /Professor in the (.+) department/i;
/**
 * extracts the department of the professor from the description
 */
function extractDepartment(title: string): string{
    let result = title.match(departmentRegex);
    if(!result || result.length < 2){
        console.log("malformed description");
        return null;    
    }
    else
        return result[1];
}

/**
 * The data object returned by the scraper
 */
export interface PersonObject{
    quality: number;
    retake: string;
    easiness: number;
    chilli: string,
    count: number;
    fname: string;
    lname: string;
    mname: string;
    id: number;
    url: string;
    university: string;
    department: string;
}
/*
let testScraper = new Scraper("University of Waterloo");
testScraper.getDataByName("Ryan Trelford").then(v => console.log(v));
*/
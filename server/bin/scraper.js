"use strict";
const cheerio = require("cheerio");
const node_fetch_1 = require("node-fetch");
//const baseUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+waterloo&query=ryan+trelford";
const baseUrl = "https://www.ratemyprofessors.com";
const queryUrl = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName";
class scraper {
    constructor(school) {
        this.uniUrl = queryUrl + "&schoolName=" + encodeURIComponent(school);
    }
    /**
     * Scrapes data by the name of the professor
     */
    getDataByName(name) {
        let webUrl = this.uniUrl + "&query=" + encodeURIComponent(name);
        return node_fetch_1.default(webUrl).then(d => d.text())
            .then(d => {
            let $ = cheerio.load(d);
            let profUrl = $("li.listing.PROFESSOR").find("a").attr("href");
            if (!profUrl)
                throw new Error(name + " not found");
            return node_fetch_1.default(baseUrl + profUrl).then(r => r.text());
        }).then(this.scrapeData);
    }
    /**
     * Scrapes data based on the id of the professor
     */
    getDataById(id) {
        let url = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + id;
        return node_fetch_1.default(url).then(d => d.text())
            .then(this.scrapeData);
    }
    /**
     * Scrapes data from a specific link
     */
    getDataByLink(url) {
        return node_fetch_1.default(url).then(d => d.text())
            .then(this.scrapeData);
    }
    scrapeData(html) {
        let $ = cheerio.load(html);
        let scoreWrapper = $(".breakdown-wrapper");
        let quality = scoreWrapper.find("div.breakdown-container").find("div.grade").html().trim();
        let breakdownSection = scoreWrapper.find(".breakdown-section");
        let retake = breakdownSection.eq(0).children().html().trim();
        let difficulty = breakdownSection.eq(1).children().html().trim();
        let chilli = breakdownSection.eq(2).find("img").attr("src");
        let amount = $(".table-toggle.rating-count.active").html().trim();
        let nameWrapper = $(".profname").children();
        let url = $("meta[property='og:url']").attr("content");
        let rtnObj = {
            fname: nameWrapper.eq(0).html().trim(),
            mname: nameWrapper.eq(1).html().trim(),
            lname: nameWrapper.eq(2).html().trim(),
            quality: Number(quality),
            retake,
            difficulty: Number(difficulty),
            chilli,
            amount: extractRatingAmount(amount),
            url,
            id: extractIdFromUrl(url)
        };
        return rtnObj;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = scraper;
let ratingRegex = /^\d+/;
/**
 * extracts the amount of ratings from a string
 * eg. extracts 18 from "18 Student Ratings"
 */
function extractRatingAmount(rating) {
    let result = rating.match(ratingRegex);
    if (result.length != 1)
        throw new Error("Invalid Format");
    else
        return Number(result[0]);
}
let idRegex = /ShowRatings.jsp\?tid=(\d+)$/;
/**
 * extracts the id number of the professor from the url on the page
 */
function extractIdFromUrl(url) {
    let result = url.match(idRegex);
    if (result.length < 2)
        throw new Error("malformed url");
    else
        return Number(result[1]);
}
let testScraper = new scraper("University of Waterloo");
let start = Date.now();
testScraper.getDataByName("Ryan Trelford").then(v => console.log(v));
//# sourceMappingURL=scraper.js.map
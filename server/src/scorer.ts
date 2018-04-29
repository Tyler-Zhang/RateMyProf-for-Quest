import * as mongodb from "mongodb";
import * as bunyan from "bunyan";
import { Scraper, PersonObject } from "./scraper";
let mongoCli = mongodb.MongoClient;

export default class ScoreResolver {

  rateTbl: mongodb.Collection;
  uniTbl: mongodb.Collection;
  voidTbl: mongodb.Collection;
  log: bunyan;
  constructor(log: bunyan, db: mongodb.Db) {
    this.log = log;

    this.rateTbl = db.collection("ratings");
    this.uniTbl = db.collection("universities");
    this.voidTbl = db.collection("void");
  }

  async getScore (university: string, names: string[]): Promise<returnedQuery[] | null> {
    names = names.map(v => v.toLowerCase());

    const uniDocument = await this.uniTbl.findOne({ name: university })
    if (!uniDocument) return null;

    const ratings: DatabasePerson[] = await this.rateTbl.find({ university, name: { $in: names } }).toArray()
    const voidDocuments = await this.voidTbl.find({ university, name: { $in: names } }).toArray()

    let resolvedNamesMap = {}
    ratings.forEach(v => resolvedNamesMap[v.name] = true)
    voidDocuments.forEach(v => resolvedNamesMap[v.name] = true)

    let remainingNames = names.filter(name => !resolvedNamesMap[name])

    if (remainingNames.length >= Number(process.env.SCRAPE_LIMIT as string)) throw new Error('Trying to query too many people')

    const scraped = await Promise.all(remainingNames.map(name => this.rmpGet(name, university)))
    const formattedRatings = ratings.map((v: DatabasePerson) => ({
      queryName: v.name,
      data: v
    }))

    const formattedVoidDocs = voidDocuments.map((v) => ({
      queryName: v.name,
      data: null
    }))

    return scraped.concat(formattedRatings).concat(formattedVoidDocs)
  }
  
  rmpGet(name: string, university: string): Promise<returnedQuery> {
    return new Scraper(university).getDataByName(name).then(d => {
      if (d == null) {
        this.voidTbl.insertOne({ university, name });
        return null;
      }
      else {
        let insertObj = Object.assign({}, d, { name });
        this.rateTbl.insertOne(insertObj);
        return d;
      }
    }).catch(e => {
      this.log.error(e);
      return null;
    }).then(data => {
      return {
        queryName: name,
        data
      }
    });
  }
}

interface DatabasePerson extends PersonObject {
  name: string
}

interface returnedQuery {
  queryName: string
  data: PersonObject | null
}

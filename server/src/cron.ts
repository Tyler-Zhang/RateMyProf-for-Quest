import { Db } from 'mongodb'
import { Scraper } from './scraper'
import * as Cronjob from 'node-cron'
import * as bunyan from 'bunyan'


export default function initCron (log: bunyan, db: Db) {
  const SCRAPE_STEP = 20 // Amount to scrape in parallel at a time

  function delay (time: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), time)
    })
  }

  async function rescrapeScores () {
    log.info('Start scraping scores')
    let ratingsCol = db.collection('ratings')
    let currPage = 0

    while (true) {
      log.info('scraping page: ' + currPage)
      const ratings = await ratingsCol.find().limit(SCRAPE_STEP).skip(currPage * SCRAPE_STEP).toArray()
      log.info(ratings)
      if (ratings.length == 0) return
      
      await Promise.all(ratings.map(rating => {
        const { university, url, name } = rating
        return new Scraper(university).getDataByLink(url)
          .then(newRating => {
            if (newRating)
              ratingsCol.updateOne({ _id: rating._id }, {$set: {...newRating, name}})
          })
      }))

      await delay(1000)
      currPage ++
    }
  }

  async function scrapeVoidRecords () {
    log.info('start scraping void docs')
    let voidCol = db.collection('void')
    let ratingCol = db.collection('ratings')
    let currPage = 0
    
    let idsToDelete: any[] = []

    while (true) {
      log.info('Scraping void page: ' + currPage)
      
      const docs = await voidCol.find().limit(SCRAPE_STEP).skip(currPage * SCRAPE_STEP).toArray()

      if (docs.length == 0) break

      await Promise.all(docs.map(doc => {
        const { university, name } = doc
        return new Scraper(university).getDataByName(name)
          .then(rating => {
            if (!rating) return
            
            idsToDelete.push(doc._id)
            return ratingCol.insertOne({...rating, name }) as any
          })
      }))

      await delay(1000)
      currPage ++
    }

    await voidCol.deleteMany({ _id: { $in: idsToDelete }})
  }

  async function refresh() {
    log.info('Start scraping')
    try {
      await rescrapeScores()
      await scrapeVoidRecords()
      log.info('Scraping done')
    } catch (e) {
      log.error(e)
    }
  }

  Cronjob.schedule('0 1 * * *', refresh, true)
}





require('dotenv').config();
import 'reflect-metadata';
import { launch } from './app';
import { startJobs } from './jobs';

async function start() {
  await launch();
  startJobs();
}

start();

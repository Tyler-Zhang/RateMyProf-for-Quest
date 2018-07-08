require('dotenv').config();
import 'reflect-metadata';
import { launch } from './app';
import { rescrapeProfessorsJob } from './jobs';

async function start() {
  await launch();
  rescrapeProfessorsJob.start();
}

start();

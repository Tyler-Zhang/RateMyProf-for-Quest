import * as cron from 'node-cron';
import { Container } from 'typedi';
import { RescrapeProfessorsJob } from './RescrapeProfressorsJob';

export const rescrapeProfessorsJob = cron.schedule('0 3 * * *', () => {
  Container.get(RescrapeProfessorsJob).run();
}, true)

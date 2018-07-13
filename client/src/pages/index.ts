import Pipeline from '../lib/Pipeline';

import { ClassSearchPage } from './ClassSearchPage';
import { ClassSchedulePage } from './ClassSchedulePage';

export const PagePipeline = new Pipeline([
  new ClassSearchPage().run,
  new ClassSchedulePage().run
],
false);

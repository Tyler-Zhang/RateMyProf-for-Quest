import Pipeline from '../lib/Pipeline';

import { ClassSearchPage } from './ClassSearchPage';

export const PagePipeline = new Pipeline([
  new ClassSearchPage().run
],
false);

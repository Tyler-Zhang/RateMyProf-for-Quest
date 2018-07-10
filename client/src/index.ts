/**
 * This script will be injected into every iframe of waterloo quest, so we should be
 * checking that we are in the correct frame (not the outer most one)
 */
import * as $ from 'jquery';
import { debounce } from 'lodash';
import { PagePipeline } from './pages';

function start () {
  if ($('#ptifrmcontent').length === 1) {
    // We are in the top most frame if this element exists.
    return;
  }

  /**
   * Debouncing ensures that the pipeline doesn't run every time the body changes.
   * We ensure that it runs atmost twice every 50 milliseconds, regardless of how
   * many times the body changes in that time frame
   */
  const debounced = debounce(PagePipeline.run, 50, { leading: true, trailing: true });

  /**
   * We build an observer which will tell us when the dom changes
   */
  const observer = new MutationObserver(debounced);
  observer.observe(document.body, { childList: true, subtree: true });
}

start();

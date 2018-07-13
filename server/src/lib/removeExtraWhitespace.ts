/**
 * Uses a regular expression to replace white space except for single
 * spaces between words
 *
 * examples:
 * hello     there
 * => hello there
 *
 * holy smokes bat
 * man !
 * => holy smokes bat man !
 */
export default function removeExtraWhitespace (str: string) {
  return str.replace(/([^\S +]| {2,})/g, '').trim();
}

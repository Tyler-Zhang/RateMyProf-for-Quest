/**
 * Simple function that calls func and return what it returns. Returns
 * failValue if func raises an error
 */
export default function attempt<Return, Fail> (failValue: Fail, func: () => Return): Return | Fail {
  try {
    return func();
  } catch (e) {
    return failValue;
  }
}

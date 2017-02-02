const universityName = "University of Waterloo"

/**
 * Wait for message to open up the suggest person tab
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == 'openSuggest') {
      chrome.tabs.create({
          active: true,
          url: encodeURI(`suggest.html?university=${universityName}&name=${request.name}`)
      });
 }
});
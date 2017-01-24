const universityName = "University of Waterloo"

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == 'openSuggest') {
      chrome.tabs.create({
          active: true,
          url: encodeURI(`suggest.html?university=${universityName}&name=${request.name}`)
      });
 }
});
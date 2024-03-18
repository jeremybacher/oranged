chrome.action.disable();
chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.create({ url: "./index.html" });
});

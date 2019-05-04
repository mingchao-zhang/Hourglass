
document.querySelector("form").addEventListener("submit", (evt) => {
  // evt.preventDefault();
  var url = document.querySelector("input[name=url]").value;
  if (url !== undefined && url != null && url !== "") {
    chrome.storage.sync.get(['blacklist'], function (result) {
      console.log(result);
      let list = result.blacklist;
      console.log(list);
      if (list === undefined) {
        list = []
      }
      list.push(url)
      chrome.storage.sync.set({ 'blacklist': list }, function () {
        console.log("Value is set to ");
        console.log(list);
      });
    });
  } else {
    console.log("url is empty");
  }
});


$(function () {
  chrome.storage.sync.get(['blacklist'], function (result) {
    console.log(result);
    let arr = result.blacklist;
    arr.forEach(element => {
      $("#existing_blacklist ul").append($("<li>").text(element).addClass(element));
      $("#existing_blacklist ul").append($("<button>").text("Delete").addClass(element));
    });
  });
});

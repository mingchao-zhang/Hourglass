// urls is an array of urls
function render_page(urls) {
  var html = ""
  for (var i=0; i < urls.length; i++) {
    url = urls[i]
    html += "<li><p>" + url + "</p>"
    html += "<button id=" + url + " class='delete_button'" + ">Delete</button></li>"
  }
  $("#blacklist_wrapper").html(html)
}

function reformat_url(url) {
  // delete "http://" or "https://""
  url = url.replace(/(^\w+:|^)\/\//, '')
  // split by "/" and take the first word
  words = url.split("/")
  // remove "www." to keep the same format as that of the frontend
  if (words[0][1] === "w" && 
      words[0][1] === "w" && 
      words[0][2] === "w" && 
      words[0][3] === ".") {
    return words[0].slice(4)
  }
  else {
    return words[0]
  } 
}

//render page at the beginning
$(function () {
  chrome.storage.sync.get(['blacklist'], function (result) {
    render_page(result.blacklist)
  })
})

// add a new url
document.querySelector("form").addEventListener("submit", (evt) => {
  var url = document.querySelector("input[name=url]").value
  if (url !== undefined && url != null && url !== "") {
    chrome.storage.sync.get(['blacklist'], function (result) {
      let list = result.blacklist;
      if (list === undefined) {
        list = []
      }
      list.push(reformat_url(url))
      chrome.storage.sync.set({ 'blacklist': list }, function() {
        render_page(list)
      })
    })
  }
})

//delete an url 
$(document).on("click", ".delete_button", function(event) {
  const id = event.target.id 
  console.log(id)
  chrome.storage.sync.get(['blacklist'], function (result) {
    let list = []
    for (var i=0; i < result.blacklist.length; i++) {
      url = result.blacklist[i] 
      if (url != id) {
        list.push(url)
      }
    }
    console.log(list)
    chrome.storage.sync.set({ 'blacklist': list }, function() {
      render_page(list)
    })
  })
})


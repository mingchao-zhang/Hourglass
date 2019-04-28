setInterval(() => {
	chrome.idle.queryState(60, (newState) => {
		console.log(newState);
		if (newState !== "locked") {
			chrome.windows.getLastFocused((window) => {
				console.log("window", window.id, window.focused);
				if (window.focused) {
					chrome.tabs.query({active: true, lastFocusedWindow: true}, (result) => {
						console.log("tab", result[0].id, result[0].url);
						let url = new URL(result[0].url);
						console.log(url.hostname.replace(/^w+\d*\./, ""));
					});
				}
			});
		}
	});
	console.log("");
}, 1000);
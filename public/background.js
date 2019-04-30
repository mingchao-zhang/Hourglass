// Testing.

// Triggers when the active tab in ANY window is changed.
browser.tabs.onActivated.addListener((activeInfo) => {
	// See if the active tab is in the focused window.
	browser.tabs.query({active: true, lastFocusedWindow: true}, (result) => {
		if (result[0].id === activeInfo.tabId) {
			console.log("Tab changed to:");
			console.log(result[0].title);
			console.log(result[0].url);
			console.log("");
		}
	})
});

/*
browser.tabs.onActivated.addListener(() => {
	console.log("Tab changed to:")
	browser.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
		console.log(tabs[0].title);
		console.log(tabs[0].url);
		console.log(tabs[0].status);
		console.log("");
	});
});
*/

/*
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	browser.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
		if (tab.id === tabs[0].id) {
			console.log("Active tab updated:");
			console.log(tab.title);
			console.log(tab.url);
			console.log(tab.status);
		}
	});
});
*/

/*
	Notes:
	- Incorrectly fires and reports no windows are in focused on tab change. 
	- Does not fire when all browser windows are unfocused (i.e. switch to other desktop app).

	Not a very useful listener.
*/

/*
browser.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === browser.windows.WINDOW_ID_NONE) {
		console.log("All browser windows have lost focus.");
	}
	else {
		console.log("Window focus changed to " + windowId.toString() + ".");
	}
});
*/

/*
setInterval(() => {
	browser.idle.queryState(60, (newState) => {
		console.log(newState);
		if (newState !== "locked") {
			browser.windows.getLastFocused((window) => {
				console.log("window", window.id, window.focused);
				if (window.focused) {
					browser.tabs.query({active: true, lastFocusedWindow: true}, (result) => {
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
*/
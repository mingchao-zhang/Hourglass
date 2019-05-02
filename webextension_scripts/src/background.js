import browser from "webextension-polyfill";
import dexie from "dexie";

/*
	User browsing history is stored in a Timeline, a collection of Events.

	An Event is a period of time spent at a specific site. Sites are identified by their URL's hostname.
	i.e. "https://site.jp", "https://site.jp/<path>", and "http://site.jp" all evaluate to "site.jp".

	// Timeline
	{
		// Event
		{
			url_hostname: String,
			begin: DateTime,
			end: DateTime
		}
	}
*/

/*
	Initialization on startup.
*/

// Create a buffer which holds the Event to insert into the Timeline.
var event_buffer = {
	url_hostname: undefined,
	begin: undefined,
	end: undefined
};

// Open the database.


/*
	When a tab in any window is updated:
	1.	Store the current date/time.
	2.	Check if the update is a URL change (i.e. a potential site change).
	3.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	4.	Check if the updated tab is the last focused window's active tab.
	5.	Check if the URL hostname (i.e. the site) changed.
*/

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	// Store the current date/time.
	let date = new Date();
	// Check if the update is a URL change.
	if (changeInfo.url) {
		// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
		browser.windows.getLastFocused({populate: true})
			.then(windowInfo => {
				if (windowInfo.focused) {
					// Check if the updated tab is the last focused window's active tab.
					if (tabId === windowInfo.tabs.filter(tab => tab.active)[0].id) {
						// Check if the URL hostname (i.e. the site) changed.
						let url_hostname = new URL(changeInfo.url).hostname;
						if (url_hostname !== event_buffer.url_hostname) {
							event_buffer.url_hostname = url_hostname;
							browser.notifications.create("Site changed in active tab", {
								type: "basic",
								iconUrl: "icon.png",
								title: "Site changed in active tab.",
								message: event_buffer.url_hostname
							});
						}
					}
				}
			});
	}
});

/*
	When the active tab in any window is changed:
	1.	Store the current date/time.
	2.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	3.	Check if the activated tab is in the last focused window.
	4.	Check if the URL hostname (i.e. the site) changed.
*/

browser.tabs.onActivated.addListener(activeInfo => {
	// Store the current date/time.
	let date = new Date();
	// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	browser.windows.getLastFocused({populate: true})
		.then(windowInfo => {
			if (windowInfo.focused) {
				// Check if the activated tab is in the last focused window.
				if (activeInfo.windowId === windowInfo.id) {
					// Check if the URL hostname (i.e. the site) changed.
					let url_hostname = new URL(windowInfo.tabs.filter(tab => tab.id === activeInfo.tabId)[0].url).hostname;
					if (url_hostname !== event_buffer.url_hostname) {
						event_buffer.url_hostname = url_hostname;
						browser.notifications.create("Site changed from tab switch", {
							type: "basic",
							iconUrl: "icon.png",
							title: "Site changed from tab switch.",
							message: event_buffer.url_hostname
						});
					}
				}
			}
		});
});

/*
	When the currently focused window changes:
	1.	Store the current date/time.
	2.	If there is no browser window:
		a.	Insert an Event into the Timeline, then set its site fo undefined.
	3.	If there is a browser window:
		a.	Find the window. Populate the Window object with its tabs.
	3.	Check if the URL hostname (i.e. the site) changed.
*/

browser.windows.onFocusChanged.addListener(windowId => {
	// Store the current date/time.
	let date = new Date();
	// If there is no browser window:
	if (windowId === browser.windows.WINDOW_ID_NONE) {
		event_buffer.url_hostname = undefined;
		browser.notifications.create("Site changed from browser defocus", {
			type: "basic",
			iconUrl: "icon.png",
			title: "Site changed from browser defocus or devtools focus.",
			message: ""
		});
	}
	// If there is a browser window:
	else {
		// Find the window.
		browser.windows.get(windowId, {populate: true})
			.then(windowInfo => {
				// Check if the URL hostname (i.e. the site) changed.
				let url_hostname = new URL(windowInfo.tabs.filter(tab => tab.active)[0].url).hostname;
				if (url_hostname !== event_buffer.url_hostname) {
					event_buffer.url_hostname = url_hostname;
					browser.notifications.create("Site changed from browser focus", {
						type: "basic",
						iconUrl: "icon.png",
						title: "Site changed from browser focus.",
						message: event_buffer.url_hostname
					});
				}
			});
	}
});

/*
	When the system's state changes.
	1.	Store the current date/time.
	2.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	3.	If the system is locked:
		a.	Insert the Event into the Timeline, then set its site to undefined.
	4.	If the system is idle or active:
		a.	Check if the URL hostname (i.e. the site) changed.
*/

browser.idle.onStateChanged.addListener((newState) => {
	// Store the current date/time.
	let date = new Date();
	// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	browser.windows.getLastFocused({populate: true})
		.then(windowInfo => {
			if (windowInfo.focused) {
				// If the system is locked, check if the Event's site isn't undefined and insert it.
				if (newState === "locked") {
					if (event_buffer.url_hostname !== undefined) {
						event_buffer.url_hostname = undefined;
						browser.notifications.create("Site changed from system state change", {
							type: "basic",
							iconUrl: "icon.png",
							title: "Site changed from system changing from idle or active to locked.",
							message: event_buffer.url_hostname
						});
					}
				}
				else {
					let url_hostname = new URL(windowInfo.tabs.filter(tab => tab.active)[0].url).hostname;
					if (url_hostname !== event_buffer.url_hostname) {
						event_buffer.url_hostname = url_hostname;
						browser.notifications.create("Site changed from system state change", {
							type: "basic",
							iconUrl: "icon.png",
							title: "Site changed from system changing locked to idle or active (probably).",
							message: event_buffer.url_hostname
						});
					}
				}
			}
		});
});



































// Testing.
/*
// Triggers when the active tab in ANY window is changed.
/*
browser.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === browser.windows.WINDOW_ID_NONE) {
		browser.notifications.create("window_switch", {type: "basic", iconUrl: "icon.png", title: "Window Switch", message: "All browser windows have lost focus."});
		console.log("All browser windows have lost focus.");
	}
	else {
		browser.notifications.create("window_switch", {type: "basic", iconUrl: "icon.png", title: "Window Switch", message: "Window focus changed to " + windowId.toString() + "."});
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
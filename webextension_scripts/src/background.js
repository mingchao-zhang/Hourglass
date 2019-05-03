import browser from "webextension-polyfill";
import db from "./database.js";

/*
	Store geolocation constantly for fast Suncalc lookups.
*/
navigator.geolocation.getCurrentPosition(position => {
	browser.storage.local.set({
		latitude: position.latitude,
		longitude: position.longitude
	})
});
navigator.geolocation.watchPosition(position => {
	browser.storage.local.set({
		latitude: position.latitude,
		longitude: position.longitude
	})
});

/*
	User browsing history is saved in a Timeline, a collection of Events.

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

// List of desired URL schemes to match, including the final ':'.
var schemes = [
	"http:",
	"https:"
];

// Buffer which holds the Event to insert into the Timeline.
var event_buffer = {
	url_hostname: undefined,
	begin: undefined,
	end: undefined
};

/*
	Autodelete browsing history older than 9 days old.

	1.	Save the current date/time - 9 days.
	2.	Delete browsing history older than 9 days old.
*/

function autodelete() {
	// Save the current date/time - 9 days.
	let date = new Date();
	date.setDate(date.getDate() - 9);
	// Delete browsing history older than 9 days old.
	db.Timeline.where("end").below(date).delete();
}

// Delete browsing history on browser startup and set an alarm.
autodelete();
browser.alarms.create("autodelete", {periodInMinutes: 1440});

/*
	Write the Event buffer to the Timeline.

	Parameters:
	date
		The date/time when the calling listener activated.
	url (optional)
		The new site. If unspecified, the Event buffer's site is set to undefined.

	1.	Reduce date/time precision to 1 minute.
	2.	If the Event buffer's site is NOT undefined:
		a.	Write the Event buffer to the Timeline.
		b.	Set the Event buffer's site to undefined.
	3.	If the new site's scheme matches:
		a.	Set the Event buffer's site to the new site and times to the saved date/time.
		b.	Write the Event buffer to the Timeline.
		c.	Create the autosave alarm.
	4.	Otherwise:
		a.	Clear the autosave alarm.
		b.	Set the Event buffer's site to undefined.
*/

function Write_Event_Buffer(date, url = {}) {
	// Reduce date/time precision to 1 second.
	date.setMilliseconds(0);
	// If the Event buffer's site is NOT undefined:
	if (event_buffer.url_hostname !== undefined) {
		// Write the Event buffer to the Timeline.
		event_buffer.end = date;
		db.Timeline.put(event_buffer);
	}
	// If the new site's scheme matches:
	if (schemes.includes(url.protocol)) {
		// Set the Event buffer's site to the new site and times to the saved date/time.
		event_buffer.url_hostname = url.hostname;
		event_buffer.begin = date;
		event_buffer.end = date;
		// Write the Event buffer to the Timeline.
		db.Timeline.put(event_buffer);
		// Create the autosave alarm.
		browser.alarms.create("autosave", {periodInMinutes: 1});
	}
	// Otherwise:
	else {
		// Clear the autosave alarm.
		browser.alarms.clear("autosave");
		// Set the Event buffer's site to undefined.
		event_buffer.url_hostname = undefined;
	}
}

/*
	Alarms:
	autosave
		Autosave the user's browsing history.
	autodelete
		Autodelete browsing history older than 9 days old.
*/

browser.alarms.onAlarm.addListener(alarmInfo => {
	// autosave
	if (alarmInfo.name === "autosave") {
		/*
			Autosave the user's browsing history. Assume the browser is in focus and the URL scheme matches.

			1.	Save the current date/time.
			2.	Find the active tab in the last focused window.
			3.	Call the Write_Event_Buffer function.
		*/

		// Save the current date/time.
		let date = new Date();
		// Find the active tab in the last focused window.
		browser.tabs.query({active: true, lastFocusedWindow: true})
			.then(tabs => {
				let url = new URL(tabs[0].url);
				// Call the Write_Event_Buffer function.
				Write_Event_Buffer(date, url);
			});
	}
	// autodelete
	if (alarmInfo.name === "autodelete") {
		autodelete();
	}
});

/*
	When the system's state changes.
	1.	Save the current date/time.
	2.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	3.	If the system is locked:
		a.	Call the Write_Event_Buffer function sans url.
	4.	If the system is idle or active:
		a.	Check if the URL hostname (i.e. the site) changed.
		b.	Call the Write_Event_Buffer function.
*/

browser.idle.onStateChanged.addListener((newState) => {
	// Save the current date/time.
	let date = new Date();
	// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	browser.windows.getLastFocused({populate: true})
		.then(windowInfo => {
			if (windowInfo.focused) {
				// If the system is locked:
				if (newState === "locked") {
					// Call the Write_Event_Buffer function sans url.
					Write_Event_Buffer(date);
				}
				// If the system is idle or active:
				else {
					// Check if the URL hostname (i.e. the site) changed.
					let url = new URL(windowInfo.tabs.filter(tab => tab.active)[0].url);
					if (url.hostname !== event_buffer.url_hostname) {
						// Call the Write_Event_Buffer function.
						Write_Event_Buffer(date, url);
					}
				}
			}
		});
});

/*
	When a tab in any window is updated:
	1.	Save the current date/time.
	2.	Check if the update is a URL change (i.e. a potential site change).
	3.	Check if the system is unlocked.
	4.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	5.	Check if the updated tab is the last focused window's active tab.
	6.	Check if the URL hostname (i.e. the site) changed.
	7.	Call the Write_Event_Buffer function.
*/

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	// Save the current date/time.
	let date = new Date();
	// Check if the update is a URL change (i.e. a potential site change).
	if (changeInfo.url) {
		// Check if the system is unlocked.
		browser.idle.queryState(60)
			.then(newState => {
				if (newState !== "locked") {
					// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
					browser.windows.getLastFocused({populate: true})
						.then(windowInfo => {
							if (windowInfo.focused) {
								// Check if the updated tab is the last focused window's active tab.
								if (tabId === windowInfo.tabs.filter(tab => tab.active)[0].id) {
									// Check if the URL hostname (i.e. the site) changed.
									let url = new URL(changeInfo.url);
									if (url.hostname !== event_buffer.url_hostname) {
										// Call the Write_Event_Buffer function.
										Write_Event_Buffer(date, url);
									}
								}
							}
						});
				}
			});
	}
});

/*
	When the active tab in any window is changed:
	1.	Save the current date/time.
	2.	Check if the system is unlocked.
	3.	Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
	4.	Check if the activated tab is in the last focused window.
	5.	Check if the URL hostname (i.e. the site) changed.
	6.	Call the Write_Event_Buffer function.
*/

browser.tabs.onActivated.addListener(activeInfo => {
	// Save the current date/time.
	let date = new Date();
	// Check if the system is unlocked.
	browser.idle.queryState(60)
		.then(newState => {
			if (newState !== "locked") {
				// Find the last focused window and check if it's in focus (i.e. if the browser is in focus). Populate the Window object with its tabs.
				browser.windows.getLastFocused({populate: true})
					.then(windowInfo => {
						if (windowInfo.focused) {
							// Check if the activated tab is in the last focused window.
							if (activeInfo.windowId === windowInfo.id) {
								// Check if the URL hostname (i.e. the site) changed.
								let url = new URL(windowInfo.tabs.filter(tab => tab.id === activeInfo.tabId)[0].url);
								if (url.hostname !== event_buffer.url_hostname) {
									// Call the Write_Event_Buffer function.
									Write_Event_Buffer(date, url);
								}
							}
						}
					});
			}
		});
});

/*
	When the currently focused window changes:
	1.	Save the current date/time.
	2.	Check if the system is unlocked.
	3.	If there is no browser window:
		a.	Call the Write_Event_Buffer function sans url.
	4.	If there is a browser window:
		a.	Find the window. Populate the Window object with its tabs.
		b.	Check if the URL hostname (i.e. the site) changed.
		c.	Call the Write_Event_Buffer function.
*/

browser.windows.onFocusChanged.addListener(windowId => {
	// Save the current date/time.
	let date = new Date();
	// Check if the system is unlocked.
	browser.idle.queryState(60)
		.then(newState => {
			if (newState !== "locked") {
				// If there is no browser window:
				if (windowId === browser.windows.WINDOW_ID_NONE) {
					// Call the Write_Event_Buffer function sans url.
					Write_Event_Buffer(date);
				}
				// If there is a browser window:
				else {
					// Find the window. Populate the Window object with its tabs.
					browser.windows.get(windowId, {populate: true})
						.then(windowInfo => {
							// Check if the URL hostname (i.e. the site) changed.
							let url = new URL(windowInfo.tabs.filter(tab => tab.active)[0].url);
							if (url.hostname !== event_buffer.url_hostname) {
								// Call the Write_Event_Buffer function.
								Write_Event_Buffer(date, url);
							}
						});
				}
			}
		});
});
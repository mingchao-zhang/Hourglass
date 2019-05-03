import browser from 'webextension-polyfill';
import { getHostname } from './service/util';
import db from './service/db.js';

let COMPLETE = 'complete';
const ONE_SECOND = 1000;

let activeTab = new Map(); // [ tabId : hostname ]
let activeIntervalFunc = null;

browser.tabs.onActivated.addListener((activeInfo) => {
	let beginTime = new Date();
	let endTime = new Date();

	browser.windows.getLastFocused({populate: true})
		.then(windowInfo => {
			if (windowInfo.focused) {
				// Check if the activated tab is in the last focused window.
				if (activeInfo.windowId === windowInfo.id) {
					// Check if the URL hostname (i.e. the site) changed.
					let activeTab = windowInfo.tabs.filter(tab => tab.id === activeInfo.tabId)[0];
					let tabId = activeTab.id;
					let hostname = getHostname(activeTab.url);
					if (hostname !== null) {
						initInterval(tabId, hostname, beginTime, endTime);
					} else {
						stopInterval();
					}
				}
			}
		});
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	console.log("=== onUpdated ===");
	//console.log(tab.highlighted);
	if (changeInfo.status === COMPLETE && tab.highlighted) {
		let beginTime = new Date();
		let endTime = new Date();
		
		browser.windows.getLastFocused({ populate: true }).then(windowInfo => {
			if (windowInfo.focused) {
				if (tabId === windowInfo.tabs.filter(tab => tab.active)[0].id) {
					if ('url' in tab) {
						let hostname = getHostname(tab.url);
						if (hostname !== null) {
							console.log(hostname);
							initInterval(tabId, hostname, beginTime, endTime);
						} else {
							stopInterval();
						}
					}		
				}
			}
		})
	}
});

browser.windows.onFocusChanged.addListener((windowId) => {
	console.log('=== onFocusChanged ===');

	let beginTime = new Date();
	let endTime = new Date();

	if (windowId === browser.windows.WINDOW_ID_NONE) {
		console.log("defocused");
		stopInterval();
	} else {
		console.log('focused');
		browser.windows.get(windowId, { populate: true }).then(windowInfo => {
			console.log(windowInfo);
			let activeTab = windowInfo.tabs.filter(tab => tab.active)[0];
			let url = activeTab.url;
			let tabId = activeTab.id;
			let hostname = getHostname(url);
			if (hostname !== null) {
				initInterval(tabId, hostname, beginTime, endTime);
			} else {
				stopInterval();
			}
		})
	}
})

function initInterval(tabId, hostname, beginTime, endTime) {
	if (activeTab.has(tabId)) {
		if (activeTab.get(tabId) !== hostname) {
			activeTab.set(tabId, hostname);
			clearInterval(activeIntervalFunc);
			activeIntervalFunc = null;

			db.time.add({ hostname: hostname, begin: beginTime, end: endTime }).then(id => {
				console.log(id);
				activeIntervalFunc = setInterval(() => {
					endTime = new Date(); 
					db.time.update(id, { end: endTime }).then(() => {
						return db.time.get(id);
					}).then(item => console.log(item))
					.catch(err => console.log(err));
				}, ONE_SECOND);
			});
		}
	} else {
		if (activeTab.size !== 0) {
			stopInterval();
		}
		activeTab.set(tabId, hostname);

		db.time.add({ hostname: hostname, begin: beginTime, end: endTime }).then(id => {
			console.log(id);
			activeIntervalFunc = setInterval(() => {
				endTime = new Date();
				db.time.update(id, { end: endTime }).then(() => {
					return db.time.get(id);
				}).then(item => console.log(item))
				.catch(err => console.log(err));
			}, ONE_SECOND);
		});
	}
}

function stopInterval() {
	activeTab.clear();
	if (activeIntervalFunc !== null) {
		clearInterval(activeIntervalFunc);
		activeIntervalFunc = null;
	}
}

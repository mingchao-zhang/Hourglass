import Dexie from "dexie";
import chrome from "webextension-polyfill";
// Create an instance.
const db = new Dexie("Hourglass");

/*
	Schemas and upgrades.
*/

// Version 1.
db.version(1)
	.stores({
		Sites: "&url_hostname",
		Timeline: "&[url_hostname+begin], url_hostname, begin, end"
	});

/*
	Functions.
*/

// Get the events the 3 longest duration and 2 most visited sites from a certain date.
export function dateEvents(date) {
	// Find the beginning and end of the date.
	let date_begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
	let date_end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
	// Find all of the Events which overlap with the specified date.
	var blacklist = null
	return db.Timeline.filter(event => {
			if (!blacklist) {
				chrome.storage.sync.get("blacklist").then(result => {
						blacklist = new Set(result.blacklist)
						console.log(blacklist)
						console.log(event.url_hostname, !blacklist.has(event.url_hostname))
						if ((event.begin <= date_end && event.end >= date_begin) &&
							!blacklist.has(event.url_hostname)) {
							return true
						}
						else {
							return false
						}
					})
			}
			else {
				console.log(event.url_hostname, !blacklist.has(event.url_hostname))
				if ((event.begin <= date_end && event.end >= date_begin) &&
					!blacklist.has(event.url_hostname)) {
					return true
				}
				else {
					return false
				}
			}	
		})
		.toArray(timeline => { // Store the timeline.
			// Truncate the Events that extend beyond the specified date.
			timeline.forEach(event => {
				event.begin = (event.begin < date_begin) ? date_begin : event.begin;
				event.end = (event.end > date_end) ? date_end : event.end;
			});

			// Group by site.
			timeline = timeline.reduce((acc, cur) => {
				(acc[cur.url_hostname] = acc[cur.url_hostname] || []).push(cur);
				return acc;
			}, {});

			// Find total site duration for each site.
			let duration = {};
			Object.keys(timeline).forEach(site => {
				duration[site] = timeline[site].map(cur => cur.end - cur.begin).reduce((acc, cur) => acc + cur);
			});

			// Sort the durations in descending order.
			duration = Object.entries(duration).sort((a, b) => {return b[1] - a[1]});

			// Find total site visits for each site.
			let visits = {};
			Object.keys(timeline).forEach(site => {
				visits[site] = timeline[site].length;
			});

			// Filter out the 3 longest duration sites and sort the visits in descending order.
			visits = Object.entries(visits).filter(site => !duration.slice(0, 3).map(cur => cur[0]).includes(site[0])).sort((a, b) => {return b[1] - a[1]});

			// Transform the Events into their percent widths and distances from the beginning of the date.
			Object.keys(timeline).forEach(site => {
				timeline[site] = timeline[site].map(event => {
					return {
						width: (event.end - event.begin)/(24*60*60*10).toString() + "%",
						left: (event.begin - date_begin)/(24*60*60*10).toString() + "%"
					}
				});
			});

			let duration_obj = duration.reduce((acc, cur) => {
				acc[cur[0]] = cur[1];
				return acc;
			}, {});

			// Return the final array.
			let result = [];
			duration.slice(0, 3).map(cur => cur[0]).forEach(site => {
				result.push(Object.create({
					url_hostname: site,
					hour: Math.floor(duration_obj[site]/(1000*60*60)).toString(),
					minute: Math.floor((duration_obj[site] % (1000*60*60))/(1000*60)).toString(),
					events: timeline[site]
				}));
			});
			visits.slice(0, 2).map(cur => cur[0]).forEach(site => {
				result.push(Object.create({
					url_hostname: site,
					hour: Math.floor(duration_obj[site]/(1000*60*60)).toString(),
					minute: Math.floor((duration_obj[site] % (1000*60*60))/(1000*60)).toString(),
					events: timeline[site]
				}));
			});

			while (result.length < 5) {
				result.push(Object.create({
					url_hostname: undefined,
					hour: undefined,
					minute: undefined,
					events: []
				}));
			}

			return result;
		});
}

export default db;
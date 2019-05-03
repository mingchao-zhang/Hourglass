import Dexie from "dexie";

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
	return db.Timeline.filter(event => {return ((event.begin <= date_end && event.end >= date_begin) ? true : false)})
		// Store the timeline.
		.toArray(timeline => {
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
						width: (event.end - event.begin)/(24*60*60*10),
						left: (event.begin - date_begin)/(24*60*60*10)
					}
				});
			});

			// Return the final array.
			let result = [];
			duration.slice(0, 3).map(cur => cur[0]).forEach(site => {
				result.push(Object.create({
					url_hostname: site,
					hour: Math.floor(duration[site]/(1000*60*60)),
					minute: Math.round((duration[site] % (1000*60*60))/(1000*60)),
					events: timeline[site]
				}));
			});
			visits.slice(0, 2).map(cur => cur[0]).forEach(site => {
				result.push(Object.create({
					url_hostname: site,
					hour: Math.floor(duration[site]/(1000*60*60)),
					minute: Math.round((duration[site] % (1000*60*60))/(1000*60)),
					events: timeline[site]
				}));
			});

			while (result.length < 5) {
				result.push(Object.create({
					url_hostname: "",
					hour: "0",
					minute: "00",
					events: []
				}));
			}

			return result;
		});
}

export default db;
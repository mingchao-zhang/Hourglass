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
	Hooks.
*/

// Foreign keys.
db.Timeline.hook("creating", (primKey, obj, transaction) => {
	db.Sites.where({url_hostname: obj.url_hostname}).count(count => {
		if (count === 0) {
			db.Sites.add({url_hostname: obj.url_hostname});
		}
	});
});

db.Timeline.hook("deleting", (primKey, obj, transaction) => {
	db.Timeline.where({url_hostname: obj.url_hostname}).count(count => {
		if (count === 0) {
			db.Sites.delete(obj.url_hostname);
		}
	});
});

export default db;
import Dexie from 'dexie';

const db = new Dexie('Hourglass');

db.version(1).stores({
  site: '++id, &url, color',
  time: '++id, hostname, begin, end'
});

export default db;

let r = require('rethinkdb');

const dbName = 'machine';

const tables = [
  'articles',
  'projects',
  'session',
  'users'
];

const indicies = {
  'articles': 'date',
  'projects': 'date'
};

r.connect({
  host: 'localhost',
  port: 28015
}, (err, conn) => {
  if(err) throw err;

  r.dbCreate(dbName).run(conn, (err, result) => {
    console.log('added db:', dbName);
    conn.use(dbName);

    Promise.all(tables.map((table) => {
      return r.tableCreate(table).run(conn).then((err, result) => {
        console.log('added table:', table);
      });
    })).then(() => {
      Promise.all(Object.keys(indicies).map((table) => {
        let key = indicies[table];
        return r.table(table).indexCreate(key).run(conn).then(() => {
          console.log('added index:', key);
        });
      })).then(() => {
        conn.close();
      });
    });
  });
});

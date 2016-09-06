let r = require('rethinkdb');

const dbName = 'machine';

const tables = [
  'articles',
  'projects',
  'session',
  'users'
];

r.connect({
  host: 'localhost',
  port: 28015
}, (err, conn) => {
  if(err) throw err;

  r.dbCreate(dbName).run(conn, (err, result) => {
    console.log('added db:', dbName);
    conn.use(dbName);

    Promise.all(tables.map((table) => {
      r.tableCreate(table).run(conn, (err, result) => {
        console.log('added table:', table);
      });
    })).then(() => {
      conn.close();
    });
  });
});

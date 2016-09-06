let r = require('rethinkdb');

const dbName = 'machine';

r.connect({
  host: 'localhost',
  port: 28015
}, (err, conn) => {
  conn.use(dbName);
  r.table('users').filter({name: 'objelisks'}).update({admin: true}).run(conn, (err, result) => {
    console.log(result);
    conn.close();
  });
});

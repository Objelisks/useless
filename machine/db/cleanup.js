let r = require('rethinkdb');

const dbName = 'machine';

r.connect({
  host: 'localhost',
  port: 28015
}, (err, conn) => {
  conn.use(dbName);
  r.table('projects').delete().run(conn, (err, result) => {
    console.log(result);
    conn.close();
  });
});

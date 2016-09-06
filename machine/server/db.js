let r = require('rethinkdb');
let connection;

module.exports.connect = function() {
  let promise = new Promise((resolve, reject) => {
    r.connect({
      host: 'localhost',
      port: 28015
    }, (err, conn) => {
      if(err) throw err;
      connection = conn;
      connection.use('machine');
      connection.on('error', () => {
        console.log('reconnecting to db...');
        connection.reconnect((err, conn) => {
          if(err) {
            console.log(err);
          } else {
            console.log('reconnected');
            connection = conn;
          }
        });
      })
      console.log('connected to db');
      resolve();
    });
  });

  return promise;
}

module.exports.run = function(query, cb) {
  query.run(connection, cb);
}

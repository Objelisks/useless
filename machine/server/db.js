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
      connection.use('test');
      console.log('connected to db');
      resolve();
    });
  });
  
  return promise;
}

module.exports.run = function(query, cb) {
  query.run(connection, cb);
}

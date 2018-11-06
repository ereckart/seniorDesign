var mysql      	= require('mysql');

var pool  = mysql.createPool({
  limit : 100,
  host     : 'waitrtech.com',
  user     : 'waitrtech',
  password : 'sdesign19',
  database : 'waitrtech'
});
pool.on('acquire', function (connection) {
  //console.log('Connection %d acquired', connection.threadId);
});
pool.on('enqueue', function () {
  //console.log('Waiting for available connection slot');
});
exports.pool = pool;

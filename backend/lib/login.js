const Cryptr = require('cryptr');
const cryptr = new Cryptr('Hg2gDCJM9XnQqDbYz66EgN3s9qgnrR2B3YJFxP9z');
var sql = require('./mysql-pool');
var counter = require('./counter');
var sms =  require('./sms');

//console.log(cryptr.encrypt('12345678'));
function login(connection, phone, password, func) {
  connection.query("SELECT * FROM users WHERE phone = ?", [phone], function (error, results, fields) {
    if (error != null) {
      func('error_misc', null);
    } else if (results.length == 0) {
      func('error_phone',null);
    } else {
      var hash = results[0].password;
      var user_id = results[0].user_id;
      if (cryptr.decrypt(hash) != password) {
        func('error_password',null);
      } else {
        counter.uniq(connection, 'pat', function (error, count) {
          if (error != null) {
            func(error,null);
          } else {
            var pat = 'PAT_'+user_id+'_'+count+'_'
                            +Math.round(Math.random()*899999+100000)+''
                            +Math.round(Math.random()*899999+100000)+''
                            +Math.round(Math.random()*899999+100000);
            func(null,pat);
          }
        });
      }
    }
  });
}
sql.pool.getConnection(function(err, connection) {
  login(connection, '9546955202', '12345678', function(error, pat) {
    console.log(error);
    console.log(pat);
  })
});

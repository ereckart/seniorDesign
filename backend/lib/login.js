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


function register(connection, first, last, phone, password, func) {
  var hash = cryptr.encrypt(password);
  if (first.length == 0) {
    func('error_first', null);
  } else if (last.length == 0) {
    func('error_last',null);
  } else if (phone.length != 10) {
    func('error_phone',null);
  } else if (password.length <= 7) {
    func('error_password',null);
  } else {
    connection.query("SELECT * FROM users WHERE phone = ?", [phone], function (error, results, fields) {
      if (error != null) {
        func('error_misc',null);
      } else if (results.length > 0) {
        func('error_phone_registered', null);
      } else {
        counter.uniq(connection, 'pending', function (error, count) {
          if (error != null) {
            func(error, null);
          } else {
            var user_id = Math.round(Math.random()*899999+100000)+''+count;
            var private_key = 'TRT_'+count+'_'
                              +Math.round(Math.random()*899999+100000)+''
                              +Math.round(Math.random()*899999+100000)+''
                              +Math.round(Math.random()*899999+100000)+''
                              +Math.round(Math.random()*899999+100000);
            var sms_key = Math.round(Math.random()*899999+100000)
            connection.query("INSERT INTO `users_pending`(`user_id`,`private_key`,`sms_key`, `first`, `last`, `phone`, `password`) VALUES (?,?,?,?,?,?,?)", [user_id,private_key,sms_key,first,last,phone,hash], function (error, results, fields) {
              if (error != null) {
                func('error_misc', null);
              } else {
                send_sms_verification(connection, private_key, function(error) {
                  if (error != null) {
                    func('error_sending_sms', null);
                  } else {
                    func(null,private_key);
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}

function send_sms_verification(connection, key, func) {
	connection.query("SELECT * FROM users_pending WHERE private_key = ?", [key], function (error, results, fields) {
		if (error != null) {
      func('error_misc');
		} else {
			var phone = results[0].phone;
			var code = results[0].sms_key;
			sms.send(phone,"Waitr+Verification+Code:+"+code);
      func(null);
		}
	});
}


exports.login = login;
exports.register = register;

sql.pool.getConnection(function(err, connection) {
  register(connection, 'Kevin', 'Thomas', '9546955202', '12345678', function(error, key) {
    console.log(error);
    console.log(key);
  })
});

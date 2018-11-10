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
            counter.token(connection, 'pat', 'PAT', 75, function(err, pat) {
              if (error != null) {
                func(error, null);
              } else {
                connection.query("INSERT INTO `users_pat`(`pat`, `user_id`) VALUES (?,?)", [pat,user_id], function (error, results, fields) {
                  if (error != null) {
                    func(error,null);
                  } else {
                    func(null,pat);
                  }
                });
              }
            });
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
        counter.uniq(connection, 'user', function (error, user_id) {
          if (error != null) {
            func(error, null);
          } else {
            var sms_key = Math.round(Math.random()*899999+100000);
            counter.token(connection, 'pkey', 'PKEY', 75, function(err, private_key) {
              if (error != null) {
                func(error, null);
              } else {
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

function verify(connection, trt, code, func) {
  connection.query("SELECT * FROM users_pending WHERE private_key = ? AND attempts > 0", [trt], function (error, results, fields) {
    if (error != null) {
      func('error_misc',null);
    } else if (results.length == 0) {
      func('error_trt',null);
    } else {
      var actual_code = results[0].sms_key;
      var user_id = results[0].user_id;
      var user_phone = results[0].phone;
      var user_password = results[0].password;
      var user_first = results[0].first;
      var user_last = results[0].last;
      if (actual_code == code) {
        counter.token(connection, 'pat', 'PAT', 75, function(err, pat) {
          if (error != null) {
            func(error, null);
          } else {
            connection.query("INSERT INTO `users_pat`(`pat`, `user_id`) VALUES (?,?)", [pat,user_id], function (error, results, fields) {
              if (error != null) {
                func(error,null);
              } else {
                connection.query("INSERT INTO `users`(`user_id`, `phone`, `password`, `first`, `last`) VALUES (?,?,?,?,?)", [user_id,user_phone,user_password,user_first, user_last], function (error, results, fields) {
                  if (error != null) {
                    func(error,null);
                  } else {
                    connection.query("DELETE FROM users_pending WHERE private_key = ? OR phone = ?", [trt,user_phone], function (error, results, fields) {
                      if (error != null) {
                      } else {
                        func(null,pat);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      } else {
        connection.query("UPDATE users_pending SET attempts = attempts-1 WHERE private_key = ?", [trt], function (error, results, fields) {
            func('error_code',null);
        });
      }
    }
  });
}

exports.login = login;
exports.register = register;
exports.verify = verify;

sql.pool.getConnection(function(err, connection) {
  login(connection, '9546955202', '12345678', function(error, pat) {
    console.log(pat);
  });
});

const Cryptr = require('cryptr');
const cryptr = new Cryptr('Hg2gDCJM9XnQqDbYz66EgN3s9qgnrR2B3YJFxP9z');
var sql = require('./mysql-pool');
var counter = require('./counter');
var sms =  require('./sms');

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
        create_pat(connection, user_id, func);
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
        var sms_key = Math.round(Math.random()*899999+100000);
        var pk2 = counter.rand_str(40);
        connection.query("INSERT INTO `users_pending`(`private_key`,`sms_key`, `first`, `last`, `phone`, `password`) VALUES (?,?,?,?,?,?); SELECT LAST_INSERT_ID() AS pk1;", [pk2,sms_key,first,last,phone,hash], function (error, results, fields) {
          if (error != null) {
            func(error, null);
          } else {
            var private_key = results[1][0].pk1+'_'+pk2;
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
}

function send_sms_verification(connection, key, func) {
  var split_key = key.split('_');
  if (split_key.length != 2) {
    func('error_private_key');
  } else {
    var v_id = split_key[0];
    var p_key = split_key[1];
  	connection.query("SELECT * FROM users_pending WHERE verify_id = ? AND private_key = ?", [v_id, p_key], function (error, results, fields) {
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
}

function verify(connection, key, code, func) {
  var split_key = key.split('_');
  if (split_key.length != 2) {
    func('error_private_key', null);
  } else {
    var v_id = split_key[0];
    var p_key = split_key[1];
    connection.query("SELECT * FROM users_pending WHERE private_key = ? AND verify_id = ? AND attempts > 0", [p_key, v_id], function (error, results, fields) {
      if (error != null) {
        func('error_misc',null);
      } else if (results.length == 0) {
        func('error_private_key',null);
      } else {
        var actual_code = results[0].sms_key;
        var user_id = results[0].user_id;
        var user_phone = results[0].phone;
        var user_password = results[0].password;
        var user_first = results[0].first;
        var user_last = results[0].last;
        if (actual_code == code) {
          connection.query("INSERT INTO `users`(`phone`, `password`, `first`, `last`) VALUES (?,?,?,?);"+
                            " DELETE FROM users_pending WHERE phone = ?;"+
                            " SELECT LAST_INSERT_ID() AS user_id;",
                             [user_phone,user_password,user_first, user_last,user_phone],
                                            function (error, results, fields) {
            if (error != null) {
              func('error_misc',null);
            } else {
              var user_id = results[2][0].user_id;
              create_pat(connection, user_id, function(error, pat) {
                if (error != null) {
                  func(error,null);
                } else {
                  func(null,pat);
                }
              });
            }
          });
        } else {
          connection.query("UPDATE users_pending SET attempts = attempts-1 WHERE private_key = ? AND verify_id = ?", [p_key, v_id], function (error, results, fields) {
              func('error_code',null);
          });
        }
      }
    });
  }
}

function create_pat(connection, user_id, func) {
  var token = counter.rand_str(40);
  connection.query("INSERT INTO `users_pat`(`token`, `user_id`) VALUES (?,?);"+
                    "UPDATE `users_pat` SET `token` = concat(LAST_INSERT_ID(),?) WHERE `pat_id` = LAST_INSERT_ID();"+
                    "SELECT `token` FROM `users_pat` WHERE `pat_id` = LAST_INSERT_ID();",
                     [token, user_id, token], function(error, results, fields) {
    if (error != null) {
      func('error_issuing_pat',null);
    } else {
      func(null, results[2][0].token);
    }
  });
}

function auth(connection, token, func) {
  connection.query("SELECT user_id FROM `users_pat` WHERE `token` = ? AND `active` = 1", [token], function (error, results, fields) {
    console.log(error);
    if (error != null) {
      func('error_misc',null);
    } else if (results.length != 1) {
      func('error_auth', null);
    } else {
      func(null,results[0].user_id);
    }
  });
}

function logout(connection, pat, func) {
  connection.query("UPDATE `users_pat` SET `active` = '0' WHERE `pat` = ?", [pat], function (error, results, fields) {
    if (error != null) {
      func('error_misc');
    } else {
      func(null);
    }
  });
}

exports.login = login;
exports.register = register;
exports.verify = verify;
exports.auth = auth;
exports.logout = logout;

/*
 * MODULE: counters
 *
 * DATABASE STRUCTURE:
 *   Table: counters
 *          Columns: name  - varchar(10)
 *                   count - bigint(20)
 *
 * uniq() generates a unique value given by a key
 *       PARAMS:
 *           connection - MySQL database Connection
 *           str - the given index for a unique value
 *           func - call back function that accepts an error and a count
*/
var sql = require('./mysql-pool');
var last_count =  0;
var counter_id = 0;

function uniq(connection, str, func) {
  connection.query("SELECT * FROM counters WHERE name = ?", [str],
                    function (error, results, fields) {
    if (error != null) {
      func('error_misc',null);
    } else {
      if (results.length > 0) {
        var output = results[0].count;
        if (last_count >= output) {
          output = Math.max(last_count, output) + 1;
        }
        last_count = output;
        connection.query("UPDATE `counters` SET `count`=GREATEST(?,`count`) WHERE name = ?", [output+1,str], function (error, results, fields) {
          if (error != null) {
            func('error_misc',null);
          } else {
            func(null,output);
          }
        });
      } else {
        connection.query("INSERT INTO `counters`(`name`, `count`) VALUES (?,?)", [str,'2'], function (error, results, fields) {
          if (error != null) {
            func('error_misc',null);
          } else {
            func(null,1);
          }
        });
      }
    }
  });
}

function set_class_id(i) {
  counter_id = i;
}

function get_class_id() {
  return counter_id;
}

function config() {
  if (counter_id == 0) {
    sql.pool.getConnection(function(error, conn) {
      uniq(conn, 'main', function(err, num) {
        if (err != null) {
          console.log('Error configuring counter');
        } else {
          set_class_id(num);
        }
      });
    });
  }
}

function token(connection, name, prefix, len, func) {
  uniq(connection, name, function(err, num) {
    if (err != null) {
      func('error_misc', null);
    } else {
      var cid = get_class_id();
      var str = prefix + '_' + num + '_' + cid + '_';
      while (str.length < len) {
        str += Math.floor(Math.random() * Math.floor(10));
      }
      func(null, str);
    }
  });
}

function rand_str(len) {
  var str = '';
  while (str.length < len) {
    str += Math.floor(Math.random() * 36).toString(36);
  };
  return str;
}

config();
exports.uniq = uniq;
exports.set_class_id = set_class_id;
exports.token = token;
exports.rand_str = rand_str;

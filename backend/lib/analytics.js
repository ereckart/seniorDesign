var sql = require('./mysql-pool');

function dump_restaurants(connection, func) {
	connection.query("SELECT * FROM `restaurants`", function(error, results, fields) {
		if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

exports.dump_restaurants = dump_restaurants;

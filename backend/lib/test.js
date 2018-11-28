var analytics = require('./analytics');
var sql = require('./mysql-pool');

sql.pool.getConnection(function(err, connection) {
	analytics.dump_restaurants(connection, function(error, results) {
		console.log(results);
	})
})

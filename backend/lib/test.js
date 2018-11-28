var analytics = require('./analytics');
var sql = require('./mysql-pool');

sql.pool.getConnection(function(err, connection) {
	analytics.last_days_item_orders(connection, 1, 10, function(error, results) {
		console.log(results);
	}, "2018-01-01", "2018-12-10")
	connection.release();
})

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

function all_time_items_orders(connection, func) {
	connection.query("SELECT COUNT(order_id), menu_item_id FROM orders GROUP BY menu_item_id ORDER BY COUNT(order_id)", function(error, results, fields) {
		if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function timespan_items_orders(connection, start, end, func) {
	connection.query("SELECT COUNT(order_id), menu_item_id FROM `orders` WHERE date BETWEEN " + start + " AND " + end + " GROUP BY menu_item_id ORDER BY COUNT(order_id)", function(error, results, fields) {
		if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function last_days_items_orders(connection, restaurant_id, days, func) {
	connection.query("SELECT title, count(orders.order_id) num_orders FROM orders JOIN menu_items on orders.menu_item_id = menu_items.menu_item_id WHERE orders.restaurant_id = "+ restaurant_id + " AND orders.date BETWEEN DATE_SUB(NOW(), INTERVAL "+ days + " DAY) AND NOW() GROUP BY title", function(error, results, fields) {
		if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function get_item_all_time_orders(connection, item_id, func) {
	connection.query("SELECT COUNT(order_id) FROM orders WHERE menu_item_id = "+item_id, function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function get_item_timespan_orders(connection, item_id, start, end, func) {
	connection.query("SELECT COUNT(order_id) FROM orders WHERE (menu_item_id = "+item_id+" ) AND (date BETWEEN "+start+" AND "+end+")", function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function avg_seating_last(connection, time_units, restaurant_id, func) {
	connection.query("SELECT "+time_units+"(reservation), AVG(TIMESTAMPDIFF(minute, arrived, seated)) FROM party WHERE restaurant_id = "+restaurant_id+" GROUP BY "+time_units+"(reservation)", function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function most_popular_year(connection, year, restaurant_id, limit, func) {
	connection.query("SELECT menu_items.title, count(orders.order_id) num_orders FROM orders JOIN menu_items on orders.menu_item_id = menu_items.menu_item_id WHERE YEAR(orders.date) = "+year+" AND orders.restaurant_id = "+restaurant_id+" group by orders.menu_item_id order by num_orders DESC limit"+limit, function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function most_popular_month(connection, month, restaurant_id, limit, func) {
	connection.query("SELECT menu_items.title, count(orders.order_id) num_orders FROM orders JOIN menu_items on orders.menu_item_id = menu_items.menu_item_id WHERE YEAR(orders.date) = "+month+" AND orders.restaurant_id = "+restaurant_id+" group by orders.menu_item_id order by num_orders DESC limit"+limit, function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}

function most_popular_day(connection, day, restaurant_id, limit, func) {
	connection.query("SELECT menu_items.title, count(orders.order_id) num_orders FROM orders JOIN menu_items on orders.menu_item_id = menu_items.menu_item_id WHERE YEAR(orders.date) = "+day+" AND orders.restaurant_id = "+restaurant_id+" group by orders.menu_item_id order by num_orders DESC limit"+limit, function(error, results){
			if (error != null) {
			func(error, null);
		} else {
			func(null, results);
		}
	});
}


exports.dump_restaurants = dump_restaurants;
exports.all_time_items_orders = all_time_items_orders;
exports.timespan_items_orders = timespan_items_orders;
exports.last_days_items_orders = last_days_items_orders;
exports.get_item_all_time_orders = get_item_all_time_orders;
exports.get_item_timespan_orders = get_item_timespan_orders;
exports.avg_seating_last = avg_seating_last;
exports.most_popular_year = most_popular_year;
exports.most_popular_month = most_popular_month;
exports.most_popular_day = most_popular_day;



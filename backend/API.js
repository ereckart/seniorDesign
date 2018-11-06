var app 		    = require('express')();
var bodyParser 	= require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function(req, res) {
  res.send("API Root");
  res.end();
  console.log('API domain');
});

app.listen(8000);

var express = require('express');
var app = express();
var path = require('path');
var PORT = 8080;
 
// Static Middleware
app.use(express.static(path.join(__dirname, '/')))
   
app.get('/', function (req, res, next) {
    res.render('index.html');
})
 
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
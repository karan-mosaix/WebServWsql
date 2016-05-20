var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
//var mysql = require("mysql");
var sql = require('./sql');

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
/*	// lets see how request looks like:
	console.log('request:\n');
	for(var key in req){
		console.log("\n" + key);
	}
*/
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processAllFieldsOfTheForm(req, res);
    }

});

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

// will be called upon form submission:
function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    // get form input and modify an html page for it:
    form.parse(req, function (err, fields, files) {
      var req_id = parseInt(fields.ID);

       // access mysql server and retrieve the name:
      sql.name_from_sql(req_id, function(resp){
          fs.readFile('form.html','utf8', function (err, data) {
            console.log("response from name_from_sql: " + resp);
            res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
          // parse lines to modify the html and put the response there:
            html_lines = data.split('\n');
            for (var i in html_lines){
              // edit the last line before body ends:
              if (html_lines[i].trim()=='</body>'){
                res.write("This is your response: " + resp);
              }
              res.write(html_lines[i]);

            }
            res.end();
          }); // end of readfile ( done with creating html)
      }); // end name_from_sql
    }); // end of form parse
}

server.listen(1185);
console.log("server listening on 1185");

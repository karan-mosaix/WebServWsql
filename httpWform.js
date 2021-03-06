var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var sql = require('./sql');
var exec = require('child_process').exec,
    child;

var form_dir = process.env.HOME + '/webServWsql/form.html'; // change this to absolute path
form_dir = 'form.html';
var server = http.createServer(function (req, res) { // THIS FUNCTION WILL BE CALLED WITH EVERY REQUEST TO SERVER
    if (req.method.toLowerCase() == 'get') {
    	// lets see how request looks like:
    	/*
      console.log('request:\n');
    	for(var key in req){
    		console.log("\n" + key);
	    }
      */
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processAllFieldsOfTheForm(req, res);
    } else if (req.method.toLowerCase() == 'put'){ // request from commandline
        cmd = [];
        processCurlMessage(req, res);
              } //End of put http method handling
});  // END OF REQUEST CALLBACK FUNCTION

function displayForm(res) {
    fs.readFile(form_dir, function (err, data) {
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
          fs.readFile(form_dir,'utf8', function (err, data) {
            console.log("response from name_from_sql: " + resp);
            res.writeHead(200, {
                            'Content-Type': 'text/html',
                                'Content-Length': data.length + resp.length
                        });
          // parse lines to modify the html and put the response there:
            var html_lines = data.split('\n');
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
} //end processAllFieldsOfTheForm


// will be called upon command line curl call:
function processCurlMessage(req, res){
  var rand_id = Math.floor(Math.random()*4+1)
  sql.name_from_sql(rand_id, function(ret_name){ // this function will be called when sql responds
    req.on('error', function(err) {
      console.error(err);
    }).on('data', function(chunk) {
      cmd.push(chunk);
    }).on('end', function() {
      cmd = Buffer.concat(cmd).toString();
      var stress_dev;
      switch (cmd[1]) {
        case 'c':
          stress_dev='CPU';
          break;
        case 'm':
          stress_dev='RAM'
          break;
        case 'd':
          stress_dev='DiskDrive'
          break;
      }
      ret_name = "Response from sql server: " + ret_name + "\nNow stressing " + stress_dev + " for 10 seconds."


      res.writeHead(200, {
                      'Content-Type': 'text/plain',
                          'Content-Length': ret_name.length+1 + 34
                  });
      res.write(ret_name + '\n');
      // run something to heatup cpu with every request:
      child = exec('stress -q '+ cmd + ' -t 10', // command line argument directly in string (Stress for 10 secs)
        {shell: "/bin/bash"},
        function (error, stdout, stderr) {      // one easy function to capture data/errors

          // console.log('stdout: ' + stdout);
          // console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('Bash exec error: ' + error);
          }
          console.log("finished stress\n");
          res.end("Finished with Stressing instance.\n");
      }); // End of exec


    }); // End of req.on ( data, end ...)

  }); // end name_from_sql

} // end processCurlMessage


server.listen(1185);
console.log("server listening on 1185");

var mysql = require("mysql");

//export functions:

module.exports = {
	//retrieve a name corresponding to an id in mysql:
	 name_from_sql: function(id, callback){
				// create a connection to databse:
				var ret_name;
				var con = mysql.createConnection({
					host: "localhost",
					// change these to match yours:
					user: "root",
					password: "qwe213",
					database: "some_name"
				});

				// connect to sql:
				con.connect(function(err){
					if(err){
					  console.log('Error connectiing to db');
					  return;
					}
					console.log('Connection established');
				});

				// query data:
				if (id>4 || id<1){
	          console.error("Invalid ID");
	          callback("Invalid ID, should be between 1 and 4");
	      }
				else {
						con.query('SELECT * FROM potluck WHERE id='+id,function(err,rows){
							if(err){
							   throw err;
							   return;
							}
							console.log('Data received from db:\n');
							/*for (var i=0;i<rows.length;i++){
							  console.log(rows[i].food);
							}*/
							console.log(rows[0].name)
							ret_name = rows[0].name;
							callback(ret_name); // call the call back function with return user name
						});
				}// end of else

				con.end(function(err) {
					// gracefull disconnection
				});
	 }
}; //module_exports

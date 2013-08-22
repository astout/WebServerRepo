//server.js
// This code was written by Alex Stout for Goal Zero, LLC private use

//get modules, setup server and db variables
var http = require("http"),
	url = require("url"),
	port = 80;
	mongo = require('mongodb'),
	Server = mongo.Server,
	MongoServer = new Server('localhost', 27017, 
		{
			safe: false,
			auto_reconnect: true
		}),
	Db = mongo.Db,
	dbName = 'GZ',
	backup = require('./backup');
	collectionName = 'DataBase',
	db = new Db(dbName, MongoServer);
var OpenDB, 
	DBCollection;	
var requestHelpers = require('./requestHelpers');
var timer = setInterval(function(){backup.clock()}, 60*60*1000); //check to do backup every hour

/**
  * Request Handlers
 */

var requestHandlers = require("./requestHandlers");
var handle = {};
handle["/"] = requestHandlers.Home;
handle["/dump"] = requestHandlers.dump;
handle["/update_db"] = requestHandlers.update_db;
handle["/db_data"] = requestHandlers.db_data;
handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;
handle["/Home"] = requestHandlers.Home;
handle["/ideaBacklogEntry"] = requestHandlers.ideaBacklogEntry;
handle["/individual"] = requestHandlers.individual;
handle["/group"] = requestHandlers.group;
handle["/favicon.ico"] = requestHandlers.favicon;
handle["/family"] = requestHandlers.family;
handle["/global"] = requestHandlers.global;
handle["/specReports"] = requestHandlers.specReports;
handle["/viewBuilder"] = requestHandlers.viewBuilder;
handle["/parameter_js"] = requestHandlers.parameter_js;
handle["/main"] = requestHandlers.param_app;
handle["/dojo_css"] = requestHandlers.dojo_css;

var s = {};
//open the connection to the collection
db.open(function(error, db)
	{
		OpenDB = db;
		db.collection(collectionName, 
			function(error, collection)
			{
				DBCollection = collection;
				console.dir(MongoServer);
				console.log('\n\n\n\t' + '\x1b[31;1m' + 'The server has started on' + '\x1b[32;1m Port: ' + port + '\n\n\n' + '\033[0m');
				console.log('\n\nDatabase used : \x1b[33;1m\''+dbName+'\' \033[0m \t Collection used: \x1b[33;1m\''+collectionName+'\'\033[0m\n');
				backup.clock();
			})
	});	

//start the server, and when we get requests, handle the path
function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request, DBCollection, url);
  }

  s = http.createServer(onRequest).listen(port);
  s.on('connection', function(sock)
	{
		console.log('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --');
		console.log('New Client Connection: ' + sock.remoteAddress);
	});
}

//route the request to the appropriate files
function route(handle, pathname, response, request, collection, url) {
  if (typeof handle[pathname] === 'function') //the pathname is associated with a handler, handle it
    handle[pathname](response, request, collection, url);
  else //Look for the file or handle an error
  	requestHelpers.return_html(pathname, response);
}



start(route, handle);
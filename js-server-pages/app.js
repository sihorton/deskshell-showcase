var path = require("path"),
	spawn = require('child_process').spawn;
var sjsCache = {};	
var running = deskShell.startApp({
	requestHandler:function(req, res) {
		reqdata = require("url").parse(req.url,true);
		switch(path.extname(reqdata.pathname)) {
			case ".sjs":
				var reqfile = reqdata.pathname;	
				if (sjsCache[reqfile]) {
					sjsCache[reqfile](req,res);
				} else {
					var serveFile = '';
					if (deskShell.packageFile) {
						serveFile = deskShell.appDef.htdocs +path.sep+ reqfile;
					} else {
						serveFile = __dirname +path.sep+ deskShell.appDef.htdocs +path.sep+ reqfile;
					} 
					console.log("serve sjs",serveFile);
					var reader = deskShell.appfs.readFile(serveFile,'utf8',function(err,contents) {
						if (err) {
							res.writeHead(500);
							res.write('Error loading '+reqfile+" "+err.message);
							res.end();
						} else {
							var sjsFn;
							eval("sjsFn = " + contents);
							sjsCache[reqfile] = sjsFn;
							sjsCache[reqfile](req,res);
						}
					});
				}
				return false;
			break;
		}
		return true;
	}
}).then(function(app) {
	//app.socketio holds the socket that can recieve and send messages to the client.
	app.socketio.on('connection', function(socket) {
		console.log("connected to client");
		socket.on('test',function(params) {
			console.log("test");
		});
	});
});
var winfunc = require("deskshell-win-func");
var fs = require("fs");

var running = deskShell.startApp({})
.then(function(app) {
	//app.socketio holds the socket that can recieve and send messages to the client.
	app.socketio.on('connection', function(socket) {
		console.log("connected to client");
		socket.on('filePicker',function(params,back) {
			console.log("file picker called",params);
			winfunc.filePicker(params ||{},function(file) {
				console.log("file picker returned",file);
				back({file:file});
			});
		});
		socket.on('folderPicker',function(params,back) {
			console.log("folder picker called",params);
			winfunc.folderPicker(params ||{},function(folder) {
				console.log("folder picker returned",folder);
				back({folder:folder});
			});
		});
		socket.on('readFile',function(params,callback) {
			console.log("readFile",params);
			fs.readFile(params.file, function (err, data) {
				 if (err) throw err;
				 if (callback) callback(data.toString());
			});
		});
	});
});
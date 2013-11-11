winfunc = require("deskshell-win-func");

var running = deskShell.startApp({})
.then(function(app) {
	//app.socketio holds the socket that can recieve and send messages to the client.
	app.socketio.on('connection', function(socket) {
		console.log("connected to client");
		socket.on('filePicker',function(params,back) {
			console.log("file picker called",params);
			winfunc.filePicker({},function(file) {
				console.log("file picker returned",file);
				back({file:file});
			});
		});
	});
});
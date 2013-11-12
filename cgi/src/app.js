var path = require("path"),
	spawn = require('child_process').spawn;
	
var running = deskShell.startApp({
	requestHandler:function(req, res) {
		reqdata = require("url").parse(req.url,true);
		switch(path.extname(reqdata.pathname)) {
			case ".php":
				params = {
					bin:__dirname+path.sep+deskShell.appDef.cgiHandlers['.php']
					,debug:false
				};
				params.env = {
					//these should not be removed, but customise and add any parameters you want. 
					'SERVER_SOFTWARE':"Deskshell"
					,'SERVER_PROTOCOL':"HTTP/1.1"
					,'GATEWAY_INTERFACE':"CGI/1.1"
					,'SERVER_NAME':"deskshell.org"
					,'SERVER_PORT':deskShell
					,'DOCUMENT_ROOT':__dirname+path.sep+'htdocs'+path.sep
					,'REDIRECT_STATUS_ENV':0
				}
				var reqEnv = {};
				/*for(var keys = Object.keys(process.env), l = keys.length; l; --l) {
				   reqEnv[ keys[l-1] ] = process.env[ keys[l-1] ];
				}*/
				for(var keys = Object.keys(params.env), l = keys.length; l; --l)	{
				   reqEnv[ keys[l-1] ] = params.env[ keys[l-1] ];
				}
				function trim(str) {
					return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				}
				var url = reqdata.pathname;
				
				//set environment variables for this request
				reqEnv['SCRIPT_NAME'] = url;
				reqEnv['PATH_INFO'] = path.normalize(reqEnv['DOCUMENT_ROOT']+url);
				reqEnv['PATH_TRANSLATED'] = path.normalize(reqEnv['DOCUMENT_ROOT']+url);
				reqEnv['QUERY_STRING'] = '';
				for(var p in reqdata.query) {
					reqEnv['QUERY_STRING'] += p+"="+encodeURIComponent(reqdata.query[p])+"&";
				}
				reqEnv['REQUEST_METHOD'] = req.method;
				
				//add request headers, "User-Agent" -> "HTTP_USER_AGENT"
				for (var header in req.headers) {
					reqEnv['HTTP_' + header.toUpperCase().split("-").join("_")] = req.headers[header];
				}
				//copy in additional special headers..
				if ('content-length' in req.headers) {
					reqEnv['CONTENT_LENGTH'] = req.headers['content-length'];
				} else {
					//not sure if this is a good idea...
					res.setHeader('Transfer-Encoding', 'chunked');
				}
				if ('content-type' in req.headers) {
					reqEnv['CONTENT_TYPE'] = req.headers['content-type'];
				}
				if ('authorization' in req.headers) {
					reqEnv['AUTH_TYPE'] = req.headers.authorization.split(' ')[0];
				}
				//user defined fn can alter the env for each request
				//if (params.envFn) reqEnv = params.envFn(reqEnv);
		
				if (params.debug) {
					console.log("request:"+url);
				}
				
				var cgi = spawn(params.bin, [], {
				  'env': reqEnv
				});
			
				req.pipe(cgi.stdin);
				if (params.sterr) {
					cgi.stderr.on('data',params.sterr);
				} else {
					cgi.stderr.on('data',function(data) {
						console.log("cgi error:"+data.toString());
					});
				}	
				var headersSent = false;
				cgi.stdout.on('data',function(data) {
					if (headersSent) {
						//stream data to browser as soon as it is available.
						//console.log(data.toString());
						res.write(data);
					} else {
						
						var lines = data.toString().split("\r\n");
						//set headers until you get a blank line...
						for(var l=0;l<lines.length;l++) {
							if (lines[l] == "") {
								res.writeHead(200);
								headersSent = true;
								res.write(lines.slice(l+1).join('\r\n'));
								break;
							} else {
								//set header
								var header = lines[l].split(":");
								res.setHeader(header[0], header[1]||'');
							}
						}
					}
					
				});
				cgi.stdout.on('end',function() {
					res.end();
				});
				return false;
			break;
		}
		return true;
	}
});
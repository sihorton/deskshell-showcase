function(req,res) {
	res.write("<html><head>");
	res.write("<title>JS Server Page</title>");
	res.write("</head><body>\n");
	res.write("<img src='../deskShellLogo.jpg'/><hr/>");
	res.write("hello world from server js.<br/>");
	res.write("This application is running on port:"+deskShell.env.port+"<br/>");
	res.write("</body></html>");
	res.end();
}
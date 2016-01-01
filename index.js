var express = require("express");
var google = require('googleapis');
var customsearch = google.customsearch('v1');
var fs = require("fs");

// env vars
require("dotenv").load();


var app = express();

app.get("/api/latest/imagesearch", function(req, res){
	fs.readFile("data/img-search.json", {
		encoding: "utf-8"
	},
	function(err, data) {
		if (err) throw err;
		var rsp = JSON.parse(data);
		res.send(JSON.stringify(rsp.data))
	})
})

app.get("/api/imagesearch/:search", function(req, res) {
	var offset = parseInt(req.query.offset) || 1;
	var start = (offset-1)*10 + 1;

    customsearch.cse.list({ 
    	cx: process.env.CX,
    	q: req.params.search, 
    	auth: process.env.API_KEY, 
    	searchType: "image", 
    	start: start
    	},
    	function(err, resp) {
	    	if(err) throw err;

	    	var imgData = [];
	    	resp.items.forEach(function(item){
	    		imgObj = {};
	    		imgObj.url = item.link;
	    		imgObj.snippet = item.snippet;
	    		imgObj.thumbnail = item.image.thumbnailLink;
	    		imgObj.context = item.image.contextLink;
	    		imgData.push(imgObj);

	    	})
	    	fs.readFile("data/img-search.json", {
				encoding: "utf-8"
			}, 
			function(err, data) {
				if (err) throw err;

				searchData = JSON.parse(data);
				if(searchData.data.length > 10){
					searchData.data.length.pop();
				}
				searchData.data.unshift({term: req.params.search, when: new Date().toJSON()});

				fs.writeFile("data/img-search.json", JSON.stringify(searchData), {
					encoding: "utf-8"
				}, function(err) {
					if (err) throw err;
					console.log("saved");
				});
			})

    		res.send(imgData);
    	});
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening at port " + port);
})
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from "path";

http.createServer(function(req, res) {

    var q = url.parse(req.url, true);

    var filename = "." + q.pathname;

    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-type': 'text/html'});
            return res.end();
        }

        const ext = path.extname(filename);

        const mimeTypes = {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".csv": "text/csv",
            ".json": "application/json",
            ".ico": "image/x-icon"
        };

        res.writeHead(200, {
            "Content-Type": mimeTypes[ext] || "application/octet-stream"
        });

        // res.writeHead(200, {'Content-type': 'text/html'});
        // res.write(data);
        return res.end(data);
    });
}).listen(8080);
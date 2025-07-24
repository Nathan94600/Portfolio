const { createServer } = require("http"),
{ readFile, readdir, writeFile } = require("fs"),
{ brotliCompress, deflate, gzip } = require("zlib"),
supportedEncoding = ["br", "gzip", "deflate", "*"],
fileExts = {
	br: ".br",
	gzip: ".gzip",
	deflate: ".zip",
	null: ""
},
fileExtRegex = /\.(br|zip|gzip)$/;
defaultHeaders = {
	HTML: {
		"content-type": "text/html",
		"content-language": "fr",
		"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net; frame-src 'self' http://projet-web.nathanmd.ovh"
	},
	CSS: {
		"content-type": "text/css"
	}
};

function compressDir(dirPath) {
	readdir(dirPath, (err, files) => {		
		if (err) console.log(`[compressDir] readdir (${dirPath})`);
		else files.filter(file => !fileExtRegex.test(file)).forEach(file => readFile(`${dirPath}/${file}`, (err, data) => {			
			if (err) console.log(`[compressDir] readFile (${dirPath}/${file})`);
			else {		
				brotliCompress(data, (err, res) => {
					if (err) console.log(`[compressDir] brotliCompress (${dirPath}/${file})`);
					else writeFile(`${dirPath}/${file}.br`, res, err => {
						if (err) console.log(`[compressDir] writeFile brotliCompress (${dirPath}/${file})`);
					});
				});

				deflate(data, (err, res) => {
					if (err) console.log(`[compressDir] deflate (${dirPath}/${file})`);
					else writeFile(`${dirPath}/${file}.zip`, res, err => {
						if (err) console.log(`[compressDir] writeFile deflate (${dirPath}/${file})`);
					});
				});

				gzip(data, (err, res) => {
					if (err) console.log(`[compressDir] gzip (${dirPath}/${file})`);
					else writeFile(`${dirPath}/${file}.gzip`, res, err => {
						if (err) console.log(`[compressDir] writeFile gzip (${dirPath}/${file})`);
					});
				});
			};
		}));
	});
};

compressDir("./javascript");
compressDir("./pages");
compressDir("./styles");

/**
 * @param { string } header Accept-Encoding
 * @returns { string | null }
 */
function chooseEncoding(header) {
	const encoding = header
		.split(",")
		.map(v => {
			const [enc, qV] = v.trim().split(";q=");

			return [enc, parseFloat(qV || "1")];
		})
		.filter(v => supportedEncoding.includes(v[0]))
		.sort((a, b) => (b[1] - a[1]) || supportedEncoding.indexOf(a[0]) - supportedEncoding.indexOf(b[0]))[0]?.[0];

	return encoding ? encoding == "*" ? supportedEncoding[0] : encoding : null;
};

createServer((req, res) => {
	const encoding = req.headers["accept-encoding"] ? chooseEncoding(req.headers["accept-encoding"]) : null;

	if (encoding) {
		defaultHeaders.HTML["content-encoding"] = encoding;
		defaultHeaders.CSS["content-encoding"] = encoding;
	};
	
	switch (req.url) {
		// pages
		case "/":
			switch (req.method) {
				case "GET":
					readFile(`./pages/index.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/bts-sio":
			switch (req.method) {
				case "GET":
					readFile(`./pages/bts-sio.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /bts-sio", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/contact":
			switch (req.method) {
				case "GET":
					readFile(`./pages/contact.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /contact", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/epreuve-e5":
			switch (req.method) {
				case "GET":
					readFile(`./pages/epreuve-e5.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /epreuve-e5", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/epreuve-e6":
			switch (req.method) {
				case "GET":
					readFile(`./pages/epreuve-e6.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /epreuve-e6", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/projets":
			switch (req.method) {
				case "GET":
					readFile(`./pages/projets.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /projets", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/veille-technologique":
			switch (req.method) {
				case "GET":
					readFile(`./pages/veille-technologique.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /veille-technologique", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		// styles
		case "/styles/index.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/index.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/index.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/contact.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/contact.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/contact.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/epreuve-e5.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/epreuve-e5.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/epreuve-e5.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/epreuve-e6.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/epreuve-e6.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/epreuve-e6.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/projets.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/projets.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/projets.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/veille-technologique.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/veille-technologique.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/veille-technologique.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/bts-sio.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/bts-sio.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/bts-sio.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/navbar.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/navbar.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/navbar.css", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.CSS, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		default:
			res.writeHead(404).end();
			break;
	}
}).listen(8080, () => console.log("http://localhost:8080"));
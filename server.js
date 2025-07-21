const { createServer } = require("http"),
{ readFile } = require("fs");

/**
 * @param { string } string
 */
async function resolveComponent(string) {
	return new Promise((resolve, reject) => {
		const matchs = string.match(/(?<!\\)(\\\\)*{{[a-zA-Z]*}}/g);

		if (!matchs || matchs.length == 0) resolve(string);
		else matchs.forEach((match, i) => readFile(`./components/${match.replace(/[\\{}]/g, "")}.html`, (err, data) => {			
			if (err) reject(err);
			else resolveComponent(string.replace(match, data)).then(res => {
				string = res;

				if (matchs.length - 1 == i) resolve(string);
			}, reason => reject(reason));
		}));
	});
};

createServer((req, res) => {
	switch (req.url) {
		// pages
		case "/":
			switch (req.method) {
				case "GET":
					readFile("./pages/index.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./pages/bts-sio.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./pages/contact.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./pages/epreuve-e5.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./pages/epreuve-e6.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./pages/veille-technologique.html", (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end()
						} else resolveComponent(data.toString()).then(str => res.writeHead(200, {
							"content-type": "text/html",
							"content-length": Buffer.from(str).length,
							"content-language": "fr",
							"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net;"
						}).end(str), reason => {
							console.log("GET / (components)", reason);
							
							res.writeHead(500).end()
						});
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
					readFile("./styles/index.css", (err, data) => {
						if (err) {
							console.log("GET /styles/index.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
					readFile("./styles/contact.css", (err, data) => {
						if (err) {
							console.log("GET /styles/contact.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
					readFile("./styles/epreuve-e5.css", (err, data) => {
						if (err) {
							console.log("GET /styles/epreuve-e5.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
					readFile("./styles/epreuve-e6.css", (err, data) => {
						if (err) {
							console.log("GET /styles/epreuve-e6.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
					readFile("./styles/veille-technologique.css", (err, data) => {
						if (err) {
							console.log("GET /styles/veille-technologique.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
					readFile("./styles/bts-sio.css", (err, data) => {
						if (err) {
							console.log("GET /styles/bts-sio.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/styles/components/navbar.css":
			switch (req.method) {
				case "GET":
					readFile("./styles/components/navbar.css", (err, data) => {
						if (err) {
							console.log("GET /styles/components/navbar.css", err);
							
							res.writeHead(500).end()
						} else res.writeHead(200, {
							"content-type": "text/css",
							"content-length": data.length
						}).end(data);
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
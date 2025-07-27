const { createServer } = require("http"),
{ readFile, readdir, writeFile } = require("fs"),
{ brotliCompress, deflate, gzip } = require("zlib"),
{ createTransport } = require("nodemailer"),
{ password, senderEmail, host, port, receiverEmail } = require("./config.json"),
supportedEncoding = ["br", "gzip", "deflate", "*"],
fileExts = {
	br: ".br",
	gzip: ".gzip",
	deflate: ".zip",
	null: ""
},
fileExtRegex = /\.(br|zip|gzip)$/,
defaultHeaders = {
	HTML: {
		"cache-control": "no-cache",
		"content-type": "text/html; charset=UTF-8",
		"content-language": "fr",
		"content-security-policy": "default-src 'self'; img-src 'self' https://cdn.jsdelivr.net; frame-src 'self' http://projet-web.nathanmd.ovh"
	},
	CSS: {
		"cache-control": "no-cache",
		"content-type": "text/css; charset=UTF-8"
	},
	SVG: {
		"cache-control": "max-age=31536000",
		"content-type": "image/svg+xml;"
	}
},
transporter = createTransport({
	host,
	port,
	secure: true,
	auth: {
		user: senderEmail,
		pass: password,
	},
}),
mailOptions = {
	to: receiverEmail,
	from: senderEmail,
	subject: "Nouveau message venant du Portfolio",
};

/**
 * @param { string } dirPath 
 * @param { string[] } except 
 */
function compressDir(dirPath, except = []) {
	readdir(dirPath, (err, files) => {		
		if (err) console.log(`[compressDir] readdir (${dirPath})`, err);
		else files.filter(file => !fileExtRegex.test(file) && !except.includes(file)).forEach(file => readFile(`${dirPath}/${file}`, (err, data) => {			
			if (err) console.log(`[compressDir] readFile (${dirPath}/${file})`, err);
			else {		
				brotliCompress(data, (err, res) => {
					if (err) console.log(`[compressDir] brotliCompress (${dirPath}/${file})`, err);
					else writeFile(`${dirPath}/${file}.br`, res, err => {
						if (err) console.log(`[compressDir] writeFile brotliCompress (${dirPath}/${file})`, err);
					});
				});

				deflate(data, (err, res) => {
					if (err) console.log(`[compressDir] deflate (${dirPath}/${file})`, err);
					else writeFile(`${dirPath}/${file}.zip`, res, err => {
						if (err) console.log(`[compressDir] writeFile deflate (${dirPath}/${file})`, err);
					});
				});

				gzip(data, (err, res) => {
					if (err) console.log(`[compressDir] gzip (${dirPath}/${file})`, err);
					else writeFile(`${dirPath}/${file}.gzip`, res, err => {
						if (err) console.log(`[compressDir] writeFile gzip (${dirPath}/${file})`, err);
					});
				});
			};
		}));
	});
};

compressDir("./pages", ["contact-error.html"]);
compressDir("./styles");
compressDir("./icons");

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
	const encoding = req.headers["accept-encoding"] ? chooseEncoding(req.headers["accept-encoding"]) : null, { pathname, searchParams } = new URL(`http://localhost${req.url}`);

	if (encoding) {
		defaultHeaders.HTML["content-encoding"] = encoding;
		defaultHeaders.CSS["content-encoding"] = encoding;
		defaultHeaders.SVG["content-encoding"] = encoding;
	};
	
	switch (pathname) {
		// icons
		case "/icons/bootstrap-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/bootstrap-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/csharp-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/csharp-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/css3-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/css3-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/figma-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/figma-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/git-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/git-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/github-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/github-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/html5-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/html5-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/java-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/java-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/javascript-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/javascript-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/linux-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/linux-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/mongodb-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/mongodb-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/mysql-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/mysql-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/nodejs-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/nodejs-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/php-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/php-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/powershell-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/powershell-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/python-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/python-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/react-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/react-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/sqlite-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/sqlite-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/typescript-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/typescript-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/unity-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`./icons/unity-original.svg${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.SVG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
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
		case "/contact-success":
			switch (req.method) {
				case "GET":
					readFile(`./pages/contact-success.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /contact-success", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/contact-error":
			switch (req.method) {
				case "GET":
					readFile(`./pages/contact-error.html`, (err, data) => {
						if (err) {
							console.log("GET /contact-error", err);
							
							res.writeHead(500).end();
						} else {
							const content = data.toString().replace("{{error}}", decodeURIComponent(searchParams.get("error") || ""));

							switch (encoding) {
								case "br":
									brotliCompress(content, (err, encodedContent) => {
										if (err) {
											console.log("[brotliCompress] GET /contact-error", err);

											res.writeHead(500).end();
										} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": encodedContent.length }).end(encodedContent);
									});
									break;
								case "gzip":
									gzip(content, (err, encodedContent) => {
										if (err) {
											console.log("[gzip] GET /contact-error", err);

											res.writeHead(500).end();
										} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": encodedContent.length }).end(encodedContent);
									});
									break;
								case "deflate":
									deflate(content, (err, encodedContent) => {
										if (err) {
											console.log("[deflate] GET /contact-error", err);

											res.writeHead(500).end();
										} else res.writeHead(200, { ...defaultHeaders.HTML, "content-length": encodedContent.length }).end(encodedContent);
									});
									break;
								case null:
									res.writeHead(200, { ...defaultHeaders.HTML, "content-length": Buffer.from(content).length }).end(content);		
									break;
								default:
									res.writeHead(500).end();
									break;
							};
						};
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
			};
			break;
		// forms
		case "/message":
			switch (req.method) {
				case "POST":
					let data = "";

					req.on("data", chunk => data += chunk).on("end", () => {
						const params = new URLSearchParams(data), nom = params.get("nom"), prenom = params.get("prenom"), email = params.get("email"), message = params.get("message");

						if (!nom) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre nom") }).end();
						else if (nom.length < 2 || nom.length > 50) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un nom qui contient entre 2 et 50 caractères") }).end();
						else if (!prenom) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre prénom") }).end();
						else if (prenom.length < 2 || prenom.length > 50) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un prénom qui contient entre 2 et 50 caractères") }).end();
						else if (!email) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre email") }).end();
						else if (email.length < 6 || email.length > 254) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un prénom qui contient entre 6 et 254 caractères") }).end();
						else if (!message) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un message") }).end();
						else if (message.length < 10 || message.length > 1000) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un message qui contient entre 10 et 1000 caractères") }).end();
						else transporter.sendMail({
							...mailOptions,
							text: `Prénom: ${prenom}\nNom: ${nom}\nEmail: ${email}\nMessage :\n\n${message}`
						}, err => {
							if (err) {
								console.log("[sendMail]", err);


							} else res.writeHead(303, { location: "/contact-success" }).end();
						});
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			};
			break;
		default:
			res.writeHead(404).end();
			break;
	};
}).listen(8080, () => console.log("http://localhost:8080"));
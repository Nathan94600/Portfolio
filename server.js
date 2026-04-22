import { createServer as createSecureServer } from "https";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile, readFileSync, readdir, writeFile, unlinkSync, readdirSync } from "fs";
import { brotliCompress, gzip } from "zlib";
import { Pool } from "pg";
import { join, extname, dirname } from "path";
import { createTransport } from "nodemailer";
import config from "./config.json" with { type: "json" };
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const { password, senderEmail, host, port, receiverEmail, certPath, keyPath, pgConfig, salt } = config;
const supportedEncoding = ["br", "gzip", "*"];
const fileExts = {
	br: ".br",
	gzip: ".gz",
	null: ""
};
const fileExtRegex = /\.(br|zip|gzip)$/;
const defaultHeaders = {
	HTML: {
		"cache-control": "no-cache",
		"content-type": "text/html; charset=UTF-8",
		"content-language": "fr",
		"content-security-policy": "default-src 'self'; frame-src 'self' http://projet-web.nathanmd.ovh"
	},
	CSS: {
		"cache-control": "no-cache",
		"content-type": "text/css; charset=UTF-8"
	},
	SVG: {
		"cache-control": "max-age=31536000",
		"content-type": "image/svg+xml;"
	},
	PNG: {
		"cache-control": "max-age=31536000",
		"content-type": "image/png;"
	},
	PDF: {
		"cache-control": "max-age=31536000",
		"content-type": "application/pdf;"
	}
};
const transporter = createTransport({
	host,
	port,
	secure: true,
	auth: {
		user: senderEmail,
		pass: password,
	},
});
const mailOptions = {
	to: receiverEmail,
	from: senderEmail,
	subject: "Nouveau message venant du Portfolio",
};
const pool = new Pool(pgConfig);
const extensionsToDelete = [".br", ".gz"];
const __dirname = dirname(fileURLToPath(import.meta.url));

const next = new Date(), now = Date.now();

function purge() {
	pool.query(`
		DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months';
		DELETE FROM blacklist WHERE created_at < NOW() - INTERVAL '1 year';
	`)
	.then(() => console.log(`[${new Date().toLocaleString()}] Purge effectuée avec succès !`))
	.catch(reason => console.error(`[${new Date().toLocaleString()}] Erreur lors de la purge :`, reason));
};

function cleanCompressedFiles(dir) {
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

		if (item.isDirectory()) cleanCompressedFiles(fullPath);
    else if (item.isFile() && extensionsToDelete.includes(extname(item.name).toLowerCase())) {
      try {
        unlinkSync(fullPath);
      } catch (err) {
        console.error(`Erreur lors de la suppression de ${fullPath} :`, err);
      };
    };
  };
};

/**
 * @param { string } filePath 
 */
function compressFile(filePath) {
	readFile(filePath, (err, data) => {			
		if (err) console.log(`[compressDir] readFile (${filePath})`, err);
		else {		
			brotliCompress(data, (err, res) => {
				if (err) console.log(`[compressDir] brotliCompress (${filePath})`, err);
				else writeFile(`${filePath}.br`, res, err => {
					if (err) console.log(`[compressDir] writeFile brotliCompress (${filePath})`, err);
				});
			});

			gzip(data, (err, res) => {
				if (err) console.log(`[compressDir] gzip (${filePath})`, err);
				else writeFile(`${filePath}.gz`, res, err => {
					if (err) console.log(`[compressDir] writeFile gzip (${filePath})`, err);
				});
			});
		};
	});
};

/**
 * @param { string } dirPath 
 * @param { string[] } except 
 */
function compressDir(dirPath, except = []) {
	readdir(dirPath, (err, files) => {		
		if (err) console.log(`[compressDir] readdir (${dirPath})`, err);
		else files.filter(file => !fileExtRegex.test(file) && !except.includes(file)).forEach(file => compressFile(`${dirPath}/${file}`));
	});
};

next.setHours(2, 0, 0, 0);

if (next.getTime() <= now) next.setDate(next.getDate() + 1);

// Requête qui s'exécute tous les jours à 2h
setTimeout(() => {
	purge();
	
	setInterval(purge, 3600000 * 24)
}, next.getTime() - now);

cleanCompressedFiles(__dirname);

compressDir("./pages", ["contact-error.html"]);
compressDir("./styles");
compressDir("./icons", ["certifs"]);

compressFile("./robots.txt");
compressFile("./sitemap.xml");

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

await pool.query(`
	CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS blacklist (
    id SERIAL PRIMARY KEY,
    ip_hash TEXT,
    email_hash TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
	);
`);

purge();

((certPath && keyPath) ? createSecureServer : createServer)({
	key: keyPath ? readFileSync(keyPath) : keyPath,
	cert: certPath ? readFileSync(certPath) : certPath
},
/**
 * @param { IncomingMessage } req 
 * @param { ServerResponse<IncomingMessage> & { req: IncomingMessage; } } res 
 */
(req, res) => {
	const encoding = req.headers["accept-encoding"] ? chooseEncoding(req.headers["accept-encoding"]) : null, { pathname, searchParams } = new URL(`http://localhost${req.url}`);

	if (encoding) {
		defaultHeaders.HTML["content-encoding"] = encoding;
		defaultHeaders.CSS["content-encoding"] = encoding;
		defaultHeaders.SVG["content-encoding"] = encoding;
	};
	
	switch (pathname) {
		// PDF
		case "/docs/certifs/css-essentials/certification.pdf":
		case "/docs/certifs/css-essentials/sea.pdf":
		case "/docs/certifs/html-essentials/certification.pdf":
		case "/docs/certifs/html-essentials/sea.pdf":
		case "/docs/certifs/javascript-essentials-1/certification.pdf":
		case "/docs/certifs/javascript-essentials-1/sea.pdf":
		case "/docs/certifs/javascript-essentials-2/certification.pdf":
		case "/docs/certifs/javascript-essentials-2/sea.pdf":
		case "/docs/certifs/python-essentials-1/certification.pdf":
		case "/docs/certifs/python-essentials-1/sea.pdf":
		case "/docs/certifs/python-essentials-2/certification.pdf":
		case "/docs/certifs/python-essentials-2/sea.pdf":
		case "/docs/certifs/cpp-essentials-1/certification.pdf":
		case "/docs/certifs/cpp-essentials-1/sea.pdf":
		case "/docs/certifs/cpp-essentials-2/certification.pdf":
		case "/docs/certifs/cpp-essentials-2/sea.pdf":
		case "/docs/certifs/introduction-to-cybersecurity/certification.pdf":
		case "/docs/certifs/introduction-to-cybersecurity/ccc.pdf":
			switch (req.method) {
				case "GET":
					readFile(`.${pathname}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.PDF, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		// icons
		case "/icons/certifs/css-essentials.png":
		case "/icons/certifs/html-essentials.png":
		case "/icons/certifs/javascript-essentials-1.png":
		case "/icons/certifs/javascript-essentials-2.png":
		case "/icons/certifs/python-essentials-1.png":
		case "/icons/certifs/python-essentials-2.png":
		case "/icons/certifs/cpp-essentials-1.png":
		case "/icons/certifs/cpp-essentials-2.png":
		case "/icons/certifs/introduction-to-cybersecurity.png":
			switch (req.method) {
				case "GET":
					readFile(`.${pathname}`, (err, data) => {
						if (err) {
							console.log("GET /", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { ...defaultHeaders.PNG, "content-length": data.length }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/icons/bootstrap-original.svg":
		case "/icons/csharp-original.svg":
		case "/icons/css3-original.svg":
		case "/icons/figma-original.svg":
		case "/icons/git-original.svg":
		case "/icons/github-original.svg":
		case "/icons/html5-original.svg":
		case "/icons/java-original.svg":
		case "/icons/javascript-original.svg":
		case "/icons/linux-original.svg":
		case "/icons/mongodb-original.svg":
		case "/icons/mysql-original.svg":
		case "/icons/nodejs-original.svg":
		case "/icons/php-original.svg":
		case "/icons/powershell-original.svg":
		case "/icons/python-original.svg":
		case "/icons/react-original.svg":
		case "/icons/sqlite-original.svg":
		case "/icons/typescript-original.svg":
		case "/icons/unity-original.svg":
			switch (req.method) {
				case "GET":
					readFile(`.${pathname}${fileExts[encoding]}`, (err, data) => {
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
		case "/competences":
			switch (req.method) {
				case "GET":
					readFile(`./pages/competences.html${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /competences", err);
							
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
		case "/styles/competences.css":
			switch (req.method) {
				case "GET":
					readFile(`./styles/competences.css${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /styles/competences.css", err);
							
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
						const params = new URLSearchParams(data),
						nom = params.get("nom"),
						prenom = params.get("prenom"),
						email = params.get("email"),
						message = params.get("message"),
						ip = req.socket.remoteAddress,
						ipHash = createHash("BLAKE2s256").update(salt + ip).digest("base64"),
						emailHash = createHash("BLAKE2s256").update(salt + email).digest("base64");

						if (!ip) res.writeHead(303, { location: encodeURI("/contact-error?error=Adresse IP introuvable ou invalide") }).end();
						else if (!nom) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre nom") }).end();
						else if (nom.length < 2 || nom.length > 50) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un nom qui contient entre 2 et 50 caractères") }).end();
						else if (!prenom) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre prénom") }).end();
						else if (prenom.length < 2 || prenom.length > 50) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un prénom qui contient entre 2 et 50 caractères") }).end();
						else if (!email) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre votre email") }).end();
						else if (email.length < 6 || email.length > 254) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un prénom qui contient entre 6 et 254 caractères") }).end();
						else if (!message) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un message") }).end();
						else if (message.length < 10 || message.length > 1000) res.writeHead(303, { location: encodeURI("/contact-error?error=Vous devez mettre un message qui contient entre 10 et 1000 caractères") }).end();
						else pool.query("SELECT * FROM blacklist WHERE ip_hash = $1 OR email_hash = $2 LIMIT 1;", [ipHash, emailHash]).then(queryRes => {
							if (queryRes.rows[0]) res.writeHead(303, { location: encodeURI("/contact-error?error=Votre adresse IP ou votre email est blacklisté") }).end();
							else {
								pool.query("INSERT INTO messages (message, ip_hash, email_hash) VALUES ($1, $2, $3)", [message, ipHash, emailHash]).catch(reason => {
									console.log("[add message]", reason);
								});

								transporter.sendMail({
									...mailOptions,
									text: `Prénom: ${prenom}\nNom: ${nom}\nEmail: ${email}\nMessage :\n\n${message}`
								}, err => {
									if (err) {
										console.log("[sendMail]", err);

										res.writeHead(303, { location: encodeURI("/contact-error?error=Erreur lors de l'envoi du message") }).end();
									} else res.writeHead(303, { location: "/contact-success" }).end();
								});
							};
						}).catch(reason => {
							console.log("[blacklist check]", reason);

							res.writeHead(303, { location: encodeURI("/contact-error?error=Erreur lors de l'envoi du message") }).end();
						});
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			};
			break;
		// autres
		case "/robots.txt":
			switch (req.method) {
				case "GET":
					readFile(`./robots.txt${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /robots.txt", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { "cache-control": "no-cache", "content-type": "text/plain; charset=UTF-8", "content-length": data.length, "content-encoding": encoding }).end(data);
					});
					break;
				default:
					res.writeHead(501).end();
					break;
			}
			break;
		case "/sitemap.xml":
			switch (req.method) {
				case "GET":
					readFile(`./sitemap.xml${fileExts[encoding]}`, (err, data) => {
						if (err) {
							console.log("GET /sitemap.xml", err);
							
							res.writeHead(500).end();
						} else res.writeHead(200, { "cache-control": "no-cache", "content-type": "application/xml; charset=UTF-8", "content-length": data.length, "content-encoding": encoding }).end(data);
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
	};
}).listen(8080, () => console.log(`${certPath && keyPath ? "https" : "http"}://localhost:8080`));
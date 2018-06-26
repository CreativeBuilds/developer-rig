exports.listen = function(gewOptions, callback = function(){}) {

	// Parse parameters
	// Default log function is console.log - Note: if verbose il false, nothing will be logged anyway
	gewOptions.logFunction = gewOptions.logFunction || function(message) { console.log(message) }

	// greenlock-express object
	var lex = require('./glx.js').create({
		server: (gewOptions.staging ? 'staging' : 'https://acme-v01.api.letsencrypt.org/directory'),
		challenges: {
			'http-01': require('le-challenge-fs').create({
				webrootPath: '/tmp/acme-challenges'
			})
		},
		store: require('le-store-certbot').create({
			webrootPath: '/tmp/acme-challenges'
		}),
		approveDomains: function (opts, certs, cb) {
			if (certs)
				opts.domains = certs.altnames
			else {
				opts.email = gewOptions.email
				opts.approveDomains  = gewOptions.approveDomains
				opts.agreeTos = true
			}
			cb(null, { options: opts, certs: certs })
		}
	})

	// Redirect HTTP->HTTPS + Challenge ACME http-01
	// let http = require('http').createServer(lex.middleware(require('redirect-https')()))

	

	

	

	// Let express listen via HTTPS + Challenge ACME tls-sni-01
	let https = require('https').createServer(lex.httpsOptions, lex.middleware(gewOptions.express)).listen(443, function () {

		if (gewOptions.verbose) {
			gewOptions.logFunction('[LE] Listening for ACME tls-sni-01 challenges on port ' + this.address().port)
			gewOptions.logFunction('Express listening on HTTPS port ' + this.address().port)
		}

	})

	callback(https);

	// Let express listen via HTTP (optional)
	if (gewOptions.plainPort) {

		gewOptions.express.listen(gewOptions.plainPort, function() {

			if (gewOptions.verbose)
				gewOptions.logFunction('Express listening on HTTP port ' + gewOptions.plainPort)

		})

	}

}

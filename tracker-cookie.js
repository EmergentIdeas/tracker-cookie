const Iron = require('iron')
const filog = require('filter-log')
let log = filog('tracker-cookie')


const createMiddleware = function(password, options) {
	options = options || {}

	let cookieName = options.cookieName || 'persistent-information'
	let requestAttribute = options.requestAttribute || 'tracker'
	let cookieMaxAge = options.cookieMaxAge || (30 * 24 * 60 * 60 * 1000)


	const middleware = function(req, res, next) {
		
		res.track = function(info, callback) {
			if(!password) {
				let msg = 'No password specified to encrypt tracking token'
				log.error(msg)
				return callback(new Error(msg))
			}
			if(info) {
				try {
					Iron.seal(JSON.stringify(info), password, Iron.defaults).then((sealed) => {
						res.cookie(cookieName, sealed, {
							maxAge: cookieMaxAge
						})
						callback()
					}, (err) => {
						callback(err)
					})
				}
				catch(e) {
					log.error({
						problem: 'Could not stringify tracked object',
						error: e,
						info: info
					})
					callback(e)
				}
				
				
			}
			else {
				res.clearCookie(cookieName)
			}
		}
		
		if (req.cookies[cookieName]) {
			if(!password) {
				let msg = 'No password specified to decrypt tracking token'
				log.error(msg)
				return next()
			}
			Iron.unseal(req.cookies[cookieName], password, Iron.defaults).then((unsealed) => {
				try {
					req[requestAttribute] = JSON.parse(unsealed)
				}
				catch(e) {
					req[requestAttribute] = unsealed
					log.error({
						problem: 'Could not parsed tracked object',
						error: e,
						info: info
					})
				}
				next()
			}, (err) => {
				log.error({
					problem: 'Could not parsed tracked object',
					error: err,
					info: info
				})
			})
		}
		else {
			next()
		}
		
		

	}

	return middleware
}

module.exports = createMiddleware
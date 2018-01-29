
A JWT like mechanism. It encrypts arbitrary information and writes it to
a cookie. Than information is loaded into the request after the cookie is parsed.

It uses the package `iron` for encryption and must be initialized with a 32 
character or longer password.

It is not intended to transfer trusted tokens between services run by different
parties, as JWT or SAML is. It is a much simpler mechanism to read and write
short, encrypted, and signed messages where all reader/writers share a secret
key. Its simplicity should help avoid the security problems seen with the JWT
protocols and libraries.

I am using this for the usual session and authenticated user tracker. The
normal caveats here will apply:

1. Don't track a ton of information because it has to be sent on every single
request which will kill performance.
2. Don't track anything which can change elsewhere, like the groups a user is a 
member of. Doing so would cause supposedly authoritative information to be kept
two places. 


Configure like:

```
let trackerCookie = require('tracker-cookie')
app.use(trackerCookie(process.env.trackerSecretKey))

```

If you'd like to set the life time of the cookie to something other than the 
default 30 days, the cookie name, or the attribute of the request object used 
for the token, you can configure with options like:

```
app.use(trackerCookie(process.env.trackerSecretKey, {
	cookieMaxAge: (7 * 24 * 60 * 60 * 1000),
	cookieName: 'persistent-information',
	requestAttribute: 'tracker'
}))

```



Usage like:

```
// print the information in the tracker
webhandle.router.use((req, res, next) => {
	console.log('tracking value: ' + JSON.stringify(req.tracker))
	next()
})

// track the last page visited other than the home page
webhandle.router.get(/.+/, (req, res, next) => {
	res.track({ path: req.path }, () => {
		next()
	})
})

// delete the cookie and clear the cached information when the homepage is loaded
webhandle.router.get('/', (req, res, next) => {
	res.track()
	next()
})
```
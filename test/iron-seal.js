const test = require('node:test')
const assert = require('node:assert')

const Iron = require("@hapi/iron")


test('simple seal', async (t) => {
	let obj = '123'
	let password = '1234123slkdfjaslkfjaslkfjalksfjlkasjfklasfjlaskjdflkasjfklsadjfasklfj4'
	let sealed = await Iron.seal(obj, password, Iron.defaults);
	console.log(sealed)
})


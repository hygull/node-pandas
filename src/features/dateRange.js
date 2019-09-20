const messages  = require('../messages/messages')

// https://javascript.info/mixins


function getDateFormats(sep) {
	let formats = [
		`yyyy${sep}mm${sep}dd`,
		`yyyy${sep}dd${sep}mm`,
		`dd${sep}mm${sep}yyyy`,
		`dd${sep}yyyy${sep}mm`,
		`mm${sep}dd${sep}yyyy`,
		`mm${sep}yyyy${sep}dd`,
	]

	return formats
}


function getDateSeparators() {
	let seps = [
		"-",
		"/"
	]

	return seps
}

function getZeroFilled(dateElem, fillZero) {
	if(fillZero) {
		if(`${dateElem}`.length === 1) {
			dateElem = '0' + dateElem
		}
	}

	return dateElem
}

// New - working way
function getDateValue(date, format, sep, fillZero) {
	let specifiers = format.split('-')

	let index = 0
	for(;index < specifiers.length;) {
		switch(specifiers[index]) {
			case "mm":
				specifiers[index] = getZeroFilled(date.getMonth(), fillZero) // Saving space by using the current input array as output array
				break
			case "dd":
				specifiers[index] = getZeroFilled(date.getDate(), fillZero)
				break
			case "yyyy":
				specifiers[index] = date.getFullYear()
		}
		++index
	}

	return specifiers.join(sep)
}


function dateRange(n = 1, format = "yyyy-mm-dd", sep = '-', fillZero=false) {
	let seps = getDateSeparators()

	if(seps.indexOf(sep) < 0) {
		messages.error(`Invalid separator specified as \`${sep}\``)
		return
	}

	let formats = getDateFormats(sep)

	if(formats.indexOf(format) < 0) {
		messages.error(`Invalid date format specified as \`${format}\``)
		return
	}

	dateRanges = []
	let date = new Date()

	for(let index=0; index < n; ++index) {
		dateRanges.push(getDateValue(date, format, sep, fillZero))
		date.setDate(date.getDate() + 1)
	}

	return dateRanges
}

module.exports = dateRange

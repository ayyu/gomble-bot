const fs = require('fs');

/**
 * @param {import('fs').PathLike} directory
 * @param {RegExp} re
 * @param {Function} callback
 */
function absForEach(directory, re, callback) {
	const files = fs
		.readdirSync(directory)
		.filter(file => file.match(re));
	files.forEach(file => callback(directory, file));
}

module.exports = {
	absForEach,
};
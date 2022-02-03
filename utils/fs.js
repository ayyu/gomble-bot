const fs = require('fs');

module.exports = {
	/**
	 * @param {import('fs').PathLike} directory
	 * @param {RegExp} re
	 * @param {Function} callback
	 */
	absForEach(directory, re, callback) {
		const files = fs
			.readdirSync(directory)
			.filter(file => file.match(re));
		files.forEach(file => callback(directory, file));
	},
};
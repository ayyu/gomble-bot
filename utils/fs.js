const fs = require('fs');

module.exports = {
  absForEach(directory, re, callback) {
    const files = fs
      .readdirSync(directory)
      .filter(file => file.match(re));
    files.forEach(file => callback(directory, file));
  }
};
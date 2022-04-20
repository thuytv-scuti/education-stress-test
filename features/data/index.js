const fs = require('fs');
const path = require('path')

const jsonsInDir = fs.readdirSync(__dirname).filter(file => path.extname(file) === '.json');
const data = {};

jsonsInDir.forEach(file => {
  const fileData = fs.readFileSync(path.join(__dirname, file));
  data[file] = JSON.parse(fileData.toString());
});

module.exports = data;

const { v4: uuidv4 } = require('uuid');

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function templateTraveser(template, data) {
  let res = template;
  if (typeof res !== 'string') {
    res = JSON.stringify(res)
  }

  if (data) {
    const dataKeys = Object.keys(data);
    for (let i = 0, len = dataKeys.length; i < len; i++) {
      const key = dataKeys[i];
      res = res.replace(new RegExp(`<${key}>`, 'gm'), data[key]);
    }
  }

  res = res.replace(new RegExp(`(<pid>)|(<PID>)`, 'gm'), process.pid.toString());
  res = res.replace(new RegExp(`<uuid>`, 'gm'), uuidv4());
  res = res.replace(new RegExp(`"?<randint>"?`, 'gm'), randInt(0, 800));

  try {
    return JSON.parse(res);
  } catch(e) {
    return res;
  }
}

module.exports = {
  templateTraveser,
}

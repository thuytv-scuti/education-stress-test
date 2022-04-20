const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const io = require('socket.io-client').io;
const axios = require('axios').default;
const dataStorage = require('../data');
const { templateTraveser: traveser } = require('../data/helpers');

const request = axios.create();

async function sendUpdate({ action, data, room, slideId }) {
  return request.put('/api/digital_slide/update', {
    action,
    data,
    room,
    slide_id: slideId,
  }).then(res => {
    if (res.status !== 200) {
      throw new Error(res.data);
    }
    return res.data;
  });
}

setDefaultTimeout(60 * 1000);

Given('I visiting edualpha app with url {string}', function(siteUrl) {
  this.siteURL = siteUrl;
  request.defaults.baseURL = this.siteURL;
});

Then(
  'I login with user {string} and password {string}',
  async function(userName, password) {
    return request.post('/api/login', {
      "email": userName,
      "password": password
    }).then(({ data }) => {
      request.defaults.headers.common = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': 'Bearer ' + data.data.token,
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'origin': request.defaults.baseURL,
      };

      return data.token;
    });
  }
);

Then(
  'I start listen messages on socket server {string} with user {int}',
  function(socketSvUrl, userId, callback) {
    this.socket = io(socketSvUrl, {
      secure: true,
      auth: {
        sender: userId,
      }
    });

    this.socket.on('connect', () => {
      callback();
    });
  }
);

Then('I listen for socket event {string}', function(event) {
  this.received[event] = [];

  this.socket.on(event, ({ data }) => {
    this.received[event].push(data);
  });

  return true;
});

Then('I visit slide {int} on board board {int}', function(slideId, boardId) {
  this.boardId = boardId;
  this.slideId = slideId;

  this.socket.emit('join-room', { room: `board:${boardId}/slide:${slideId}` });
});

When(
  'I create a object with {string} and id {string}',
  async function(key, id) {
    const obj = traveser(
      dataStorage[key],
      { id: traveser(id) }
    );

    return sendUpdate({
      action: 'create', 
      data: [obj],
      room: `board:${this.boardId}/slide:${this.slideId}`,
      slideId: this.slideId,
    });
  }
);

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
async function updateObject(data, count, time) {
  const promises = [];

  for (let i = 0; i < count; i++) {
    promises.push(
      sendUpdate({
        action: 'update', 
        data: data,
        room: `board:${this.boardId}/slide:${this.slideId}`,
        slideId: this.slideId,
      })
    );

    await sleep(40);
  }

  const updateReq = Promise.all(promises);

  if (time) {
    const rejectOnTimeout = new Promise((_, reject)=>{
      setTimeout(function() { 
        reject(new Error('Too slow, you need to speed up boyyy'));
      }, time);
    });

    return Promise.race([rejectOnTimeout, updateReq]);
  }

  return updateReq;
}

When(
  'I update object {string} with {string}',
  async function(uuid, key) {
    return updateObject.call(
      this,
      [traveser(dataStorage[key], { id: traveser(uuid)})],
      1
    );
  }
);

When(
  'I update object {string} with {string} {int} times',
  async function(uuid, key, num) {
    return updateObject.call(
      this,
      [traveser(dataStorage[key], { id: traveser(uuid)})],
      num
    );
  }
);

When(
  'I update object {string} with {string} {int} times within {int} seconds',
  async function(uuid, key, num, time) {
    return updateObject.call(
      this,
      [traveser(dataStorage[key], { id: traveser(uuid)})],
      num,
      time * 1000
    );
  }
);

When(
  'I select objects {string}',
  function(ids) {
    return sendUpdate({
      action: 'select', 
      data: {
        selected: String(traveser(ids)).split(','),
        deselected: []
      },
      room: `board:${this.boardId}/slide:${this.slideId}`,
      slideId: this.slideId,
    });
  }
);

When(
  'I unselect objects {string}',
  function(ids) {
    return sendUpdate({
      action: 'select', 
      data: {
        selected: [],
        deselected: String(traveser(ids)).split(',')
      },
      room: `board:${this.boardId}/slide:${this.slideId}`,
      slideId: this.slideId,
    });
  }
);

When(
  'I delete objects ids {string}',
  async function(ids) {
    return sendUpdate({
      action: 'delete', 
      data: String(traveser(ids)).split(','),
      room: `board:${this.boardId}/slide:${this.slideId}`,
      slideId: this.slideId,
    });
  }
);

function assertMsgsWithTime(count, action, time, callback) {
  const endTime = Date.now() + time;

  let assertionInterval = setInterval(() => {
    const messages = this.received[action];
    if (Array.isArray(messages) && messages.length === count) {
      messages.splice(0, count);
      clearInterval(assertionInterval);
      callback();
    }

    if (Date.now() > endTime) {
      clearInterval(assertionInterval);
      callback(new Error('No message found'));
    }
  }, 500);
}

Then('I receive {int} {string} message[s] with socket', function(count, action, callback) {
  assertMsgsWithTime.call(this, count, action, 60, callback);
});

Then('I receive {int} {string} message[s] with socket within {int} seconds', function(count, action, time, callback) {
  assertMsgsWithTime.call(this, count, action, time, callback);
});

Then('I wait for {int} seconds', function(time, callback) {
  setTimeout(callback, time * 1000);
});


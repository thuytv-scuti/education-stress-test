const { Before, After } = require('@cucumber/cucumber');

Before({ tags: '@edusocket' }, function() {
  this.received = {};
});

After({ tags: '@edusocket' }, function() {
  this.received = {};
  this.socket?.disconnect();
});

const Ping = require('ping.js');

const pin = new Ping();

pin.ping("https://github.com", function(err, data) {
  // Also display error if err is returned.
  if (err) {
    console.log(err)
console.log(data)
  }
});
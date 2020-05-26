const {gzip} = require('node-gzip');
const snappy = require('snappy');
const lzo = require('lzo');

let event = {
  "timestamp": "2019-08-02T15:15:05-03:00",
  "message_id": "fake_message_id",
  "received_at": "2019-08-02T15:15:06-03:00",
  "type": "TRACK",
  "v": "1",
  "action": "fake-event-action-name",
  "reference": "00102fake_reference",
  "api_key": "fake_api-key",
  "network": {
      "id": "fake_network_id",
      "type": "PORTAL"
  },
  "context": {
      "referrer": "http://localhost:8080/",
      "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
      "utm": {
          "source": "direct"
      },
      "os": {
          "name": "Linux",
          "version": "x86.64"
      },
      "browser": {
          "name": "Chrome",
          "version": "74.0.3729.157"
      },
      "platform": {
          "name": "Desktop",
          "type": "Browser"
      }
  },
  "properties": {
      "revenue": 5.988,
      "currency": "BRL",
      "target": {
        "id":"fake_id",
        "title":"fake_target_title"
      },
      "custom_data": {
          "propriedade_1": "fake custom data value 1",
          "propriedade_2": "fake custom data value 2"
      }
  }
}

// event = JSON.stringify(event);

// // Full event
// gzip(event).then(res => console.log("Full Gzip:", res.toString('base64').length));

// snappy.compress(event, (err, res) => {
//   if (err) {
//     return console.error(err);
//   }

//   console.log("Full Snappy:", res.toString('base64').length);
// });

// let res = lzo.compress(event);
// console.log("Full LZO:", res.toString('base64').length);

// Partial event

event = {"message_id":"0039132d9-8ff8-11ea-a03f-0050569e7799","reference":"04760209651169990","action":"recebeu-notificacao-sms"}

event = JSON.stringify(event);

gzip(event).then(res => console.log("Partial Gzip:", res.toString('base64').length));

snappy.compress(event, (err, res) => {
  if (err) {
    return console.error(err);
  }

  console.log("Partial Snappy:", res.toString('base64').length);
});

res = lzo.compress(event);
console.log("Partial LZO:", res.toString('base64').length);
//bird social network server
//license: MIT (https://opensource.org/licenses/MIT)

var express = require("express");
var gcm = require("node-gcm");

var API_KEY = "AIzaSyA9GUCOijnx4GYz-zRcOx4MW1P9uTec0EE";
var gcmSender = new gcm.Sender(API_KEY);

var app = express();
var bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//test methods
app.get("/test", function (req, res) {
  res.send("salut !");
});

app.get("/test_messages", function (req, res) {
  res.json(["test #tag", "other message #tag"]);
});

app.post("/test_push", function (req, res) {
  var regId = req.body.regId;
  if (!regId) {
    res.status(400).send();
  } else {
    res.status(200).send();
    notifyChange(regId, "#test_hash", "This is a test #test_hash");
  }
});

//in memory storage
var storage = {};
var subs = {};

//Main API
app.post("/messages", function (req, res) {
  var message = req.body.message;
  var hashArr = getHashArray(message);
  if (hashArr.length) {
    res.status(200).send();
    for (var hash in hashArr) {
      hash = hashArr[hash];
      if (!storage[hash]) storage[hash] = [];
      storage[hash].push(message);

      if (!subs[hash]) subs[hash] = [];

      var devices = subs[hash];
      for (var regId in devices) {
        regId = devices[regId];
        notifyChange(regId, hash, message);
      }
    }
  } else {
    res.status(400).send();
  }
});

app.get("/messages", function (req, res) {
  var hash = req.query.hash;
  if (hash) {
    if (hash.charAt() != "#") hash = "#" + hash;
    if (!storage[hash]) storage[hash] = [];
    res.json(storage[hash]);
  } else {
    res.status(400).send();
  }
  console.log(hash);
});

//Push notifications API
app.post("/subscribe", function (req, res) {
  var regId = req.body.regId;
  var hash = req.body.hash;

  if (!regId || !hash) {
    res.status(400).send();
  } else {
    if (hash.charAt() != "#") hash = "#" + hash;

    if (!subs[hash]) subs[hash] = [];
    if (subs[hash].indexOf(regId) < 0) subs[hash].push(regId);
    res.status(200).send();
  }
});

app.post("/unsubscribe", function (req, res) {
  var regId = req.body.regId;
  var hash = req.body.hash;

  if (!regId || !hash) {
    res.status(400).send();
  } else {
    if (hash.charAt() != "#") hash = "#" + hash;

    if (!subs[hash]) subs[hash] = [];
    var index = subs[hash].indexOf(regId);
    if (index >= 0) subs[hash].splice(index);
    res.status(200).send();
  }
});

app.post("/issubscribed", function (req, res) {
  var regId = req.body.regId;
  var hash = req.body.hash;

  if (!regId || !hash) {
    res.status(400).send();
  } else {
    if (hash.charAt() != "#") hash = "#" + hash;
    if (!subs[hash]) subs[hash] = [];
    var index = subs[hash].indexOf(regId);
    var isSubbed = index >= 0;
    res.json(isSubbed);
  }
});

//serve itself
app.get("/", function (req, res) {
  res.sendFile(__filename);
});

app.listen(process.env.PORT || 6036);

//helper functions

function getHashArray(message) {
  var ret = [];
  var reg = new RegExp(/#\w+/g);
  do {
    var match;
    match = reg.exec(message);
    if (match) {
      ret.push(match[0]);
    }
  } while (match);

  return ret;
}

function notifyChange(regId, hash, message) {
  console.log("gcm try");
  console.log(arguments);
  var message = new gcm.Message({
    data: {
      hash: hash,
      message: message,
    },
  });

  gcmSender.send(message, [regId], 4, function (err, result) {
    console.log("gcm result");
    console.log(arguments);
  });
}

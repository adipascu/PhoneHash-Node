//bird social network server
//license: MIT (https://opensource.org/licenses/MIT)

var express = require("express");


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

//in memory storage
var storage = {};

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

console.log("Bird server started");

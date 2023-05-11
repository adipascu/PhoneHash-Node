//bird social network server
//license: MIT (https://opensource.org/licenses/MIT)

import express from 'express'
import bodyParser from 'body-parser';
import os from 'node:os'
import cors from 'cors'

const app = express();

// allow cross origin requests from all domains
app.use(cors());

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
const storage: { [key: string]: string[] } = {};

//Main API
app.post("/messages", function (req, res) {
  const message = req.body.message;
  const hashArr = getHashArray(message);
  if (hashArr.length) {
    res.status(200).send();
    hashArr.forEach((hash) => {
      if (!storage[hash]) storage[hash] = [];
      storage[hash].push(message);
    });
  } else {
    res.status(400).send();
  }
});

app.get("/messages", function (req, res) {
  let hash = req.query.hash;
  if (typeof hash === "string") {
    if (hash.charAt(0) != "#") {
      hash = "#" + hash
    };
    if (!storage[hash]) {
      storage[hash] = [];
    }
    res.json(storage[hash]);
  } else {
    res.status(400).send();
  }
  console.log(hash);
});

//serve itself
app.get("/", function (req, res) {
  res.setHeader('Content-Type', 'text/x.typescript');
  res.sendFile(__filename);
});


const PORT = 3000

app.listen(PORT, () => {
  console.log("Bird server started on http://" + os.hostname() + ":" + PORT + " 🚀");
});

//helper functions

function getHashArray(message: string) {
  console.log("getHashArray", message)
  const ret: string[] = [];
  const reg = new RegExp(/#\w+/g);
  let match;
  do {
    match = reg.exec(message);
    if (match) {
      ret.push(match[0]);
    }
  } while (match);

  return ret;
}

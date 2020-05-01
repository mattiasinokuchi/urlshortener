// avoid silent errors, make the app faster, avoid unsafe syntax for the future
'use strict';

// mount web app framework
const express = require('express');

// mount database
const mongo = require('mongodb');

// mount database framework
const mongoose = require('mongoose');

// allow access to restricted resources so that the app can be tested by FCC 
const cors = require('cors');

// mount dns module for validation of URL
const dns = require("dns");

// create server
const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
});

app.use(cors());

//definition of the constructor for MongoDB documents
const mongooseSchema = new mongoose.Schema ({
  original_url: {
    type: String,
    unique: false
  },
  short_url: {
    type: String,
    unique: false
  }
});

// definition of the class (working copy of the constructor) for MongoDB documents 
const MongooseModel = mongoose.model ("MongooseModel", mongooseSchema);


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// find new number for short URL
let newShortURL = 0;
function findNewShortURL() {
  MongooseModel
    .findOne()
    .sort({short_url: "descending"})
    .exec((err, doc) => {
      if (err) return console.error(err);
      newShortURL = (parseInt(doc.short_url)+1).toString();
  });
}
  
/*    // searches for duplicate URL in the database
      MongooseModel.find({ original_url: url}, (err, docs) => {
        if (err) return console.error(err);
      });
*/

// POST a URL
app.post("/api/shorturl/new", (req, res) => {
  let url = new URL(req.body.url);
  // Check if the URL is valid
  dns.lookup(url.hostname, (err, address, family) => {
    if (err) {
      console.error(err);
      res.json({
        error: "invalid URL"
      });
    } else {
      findNewShortURL;
      let mongodbDocument = new MongooseModel({
        original_url: req.body.url,
        short_url: newShortURL
      });
      mongodbDocument.save((err, data) => {
        if (err) return console.error(err);
      });
      res.json({
        original_url: req.body.url,
        short_url: newShortURL});
    }
  });
});

// log documents in database
MongooseModel.find((err, doc)=> {
  if (err) return console.error(err);
  console.log(doc);
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
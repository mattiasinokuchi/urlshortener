// mount web app framework
const express = require("express");

// create new router object
const router = express.Router();

// mounts middleware function to serve web page
router.get('/', (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

module.exports = router;
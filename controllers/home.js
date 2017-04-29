/**
 * GET /
 * Home page.
 */
const path = require('path');
exports.index = (req, res) => {
  console.log(__dirname);
  res.sendFile('/../public/dist/index.html');
};

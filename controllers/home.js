'use strict';

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  console.log(__dirname);
  res.sendFile('/../public/dist/index.html');
};

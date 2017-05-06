'use strict';

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.send(' blau');
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  res.json({ success: true, message: 'Arquivo enviado com sucesso!' });
};

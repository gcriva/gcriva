'use strict';

const chalk = require('chalk');
const rollbar = require('rollbar');
const app = require('./app');

if (process.env.NODE_ENV === 'production') {
  app.use(rollbar.errorHandler(process.env.ROLLBAR_TOKEN));
  rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_TOKEN);
}

app.listen(process.env.PORT || '3000', () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
});

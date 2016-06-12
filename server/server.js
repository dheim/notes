const express         = require('express');
const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');
const app             = express();

const config          = require('./config');

app.use(express.static(__dirname + '/../public', {
  dotfiles: 'ignore'
}))

app
  .use(bodyParser.json())
  .use('/api', require('./routes'))
  .listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
  });
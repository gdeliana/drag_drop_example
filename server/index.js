const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

global.request_uri = process.env.request_uri || '/';
global.port = process.env.port || 3001;
global.mysql_port = process.env.mysql_port || 1237;

const app = express();

app.use(helmet());

app.use(cors());

app.use(bodyParser.json());

app.all("*", function (req, resp, next) {
    console.log(req.params); // do anything you want here
    next();
});

require('./src/routes/routes')(app);

app.listen(global.port, () => console.log(`Server started on port ${global.port}`));


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const postgraphile = require('./postgraphile');

const app = express();
app.use(cors());
app.use(postgraphile);

app.listen(process.env.PORT);

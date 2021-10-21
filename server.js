const http = require('http');
const app = require('./app');
const { port } = require('./config');
global.__basedir = __dirname;

const portNumber = port || 3000;

const server = http.createServer(app);

server.listen(portNumber);
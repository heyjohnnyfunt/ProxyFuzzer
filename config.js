var config = {};

var fs = require('fs');

function readFileInArray(file) {
    return fs.readFileSync(file).toString().split("\r\n");
}

config.port = 8887;
config.testCaseCounter = 0;
config.userAgentsFile = 'user-agents.txt';
config.cacheControl = ['no-cache', 'max-age=5', 'no-store', 'cache-extension'];

config.accecptCompress = ['compress', 'deflate', 'exi', 'gzip', 'identity', 'pack200-gzip',
    'brotli', 'bzip2', 'lzma', 'peerdist', 'sdch', 'xpress', 'xz'];

config.userAgentsArray = readFileInArray(config.userAgentsFile);

config.postLength = 1000000;

module.exports = config;
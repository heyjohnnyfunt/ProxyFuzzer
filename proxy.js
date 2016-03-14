var http = require('http');
var url = require('url');
var net = require('net');

var config = require('./config.js');
var generator = require('./generator.js');

var server = http.createServer(function (request, response) {

        console.log(request.url);

        var ph = url.parse(request.url);
        var options = {
            host: ph.host,
            port: ph.port,
            hostname: ph.hostname,
            method: request.method,
            path: ph.path,
            pathname: ph.pathname,
            query: ph.query,
            search: ph.search,
            protocol: ph.protocol,
            slashes: false,
            auth: ph.auth,
            hash: ph.hash,
            headers: request.headers
        };

        //console.log(options);
        //if (config.testCaseCounter < 1) console.log(options);

        options = generator.httpHeader.fuzzMainHeaders(options);
        options = generator.httpHeader.fuzzCookies(options);
        options = generator.httpHeader.fuzzContent(options);
        options = generator.httpHeader.fuzzDate(options);
        //if (request.method === 'GET' )
        options = generator.getParams(options);
        /*if (request.method === 'POST') */options = generator.postParams(options);

        //if (config.testCaseCounter < 2) console.log(options);

        var proxyRequest = http.request(options);

        proxyRequest.on('response', function (proxyResponse) {

            proxyResponse.on('data', function (chunk) {
                response.write(chunk, 'binary');
            });

            proxyResponse.on('error', function (err) {
                console.error('Error in proxyResponse: \n => ' + err);
                response.end();
            });

            proxyResponse.on('end', function () {
                response.end();
            });

            response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        });

        proxyRequest.on('error', function (err) {
            console.error('Error in proxyRequest: \n => ' + err);
        });

        request.on('data', function (chunk) {
            console.log(chunk.toString());
            var data = generator.formData(chunk.toString());
            proxyRequest.write(new Buffer(data, "binary"), 'binary');
        });

        request.on('end', function () {
            console.log('#' + config.testCaseCounter + ' (test case)');
            proxyRequest.end();
        });
    })
    .on('connect', function (request, socketRequest, head) {

        console.log('https://' + request.url);
        var ph = url.parse('http://' + request.url);

        var socket = net.connect(ph.port, ph.hostname, function () {
            socket.write(head);
            // Сказать клиенту, что соединение установлено
            socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n");
        });
        // Туннелирование к хосту
        socket.on('data', function (chunk) {
            socketRequest.write(chunk);
        });
        socket.on('end', function () {
            socketRequest.end();
        });
        socket.on('error', function () {
            // Сказать клиенту, что произошла ошибка
            socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n");
            socketRequest.end();
        });
        // Туннелирование к клиенту
        socketRequest.on('data', function (chunk) {
            socket.write(chunk);
        });
        socketRequest.on('end', function () {
            socket.end();
        });
        socketRequest.on('error', function () {
            socket.end();
        });
    });

server.listen(config.port, function (err) {
    if (err) throw err;
    console.log('Proxy port: ' + config.port);
});
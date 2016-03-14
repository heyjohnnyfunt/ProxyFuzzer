/**
 * Created by skogs on 13.03.2016.
 */

var qs = require('querystring');

var config = require('./config');
var parseCookie = require('./parseCookie');
var rand = require('./randomize');

function isNumber(num) {
    return !isNaN(parseInt(num) && isFinite(num))
}

var httpHeader = {};


httpHeader.fuzzCookies = function (options) {

    var cookie = options.headers.cookie;
    if (cookie === undefined) cookie = rand.randomString(100, "aA#");
    cookie = parseCookie.parse(cookie);

    //console.log(cookie);
    for (var key in cookie) {
        if (!cookie.hasOwnProperty(key)) continue;
        cookie[key] = rand.randomString(rand.randBool() ? cookie[key].length : rand.randRange(0, 100000), 'aA#')
    }
    //console.log(cookie);

    return options;
};

httpHeader.fuzzMainHeaders = function (options) {

    config.testCaseCounter++;

    /*Список названий и версий клиента и его компонентов с комментариями.*/
    options.headers['user-agent'] = rand.randArr(config.userAgentsArray);

    /*Список допустимых форматов ресурса.*/
    options.headers['accept'] = rand.randomString(100, "aA#") + ' ' + options.headers['accept'];

    /*Перечень поддерживаемых кодировок для предоставления пользователю.*/
    options.headers['accept-charset'] = 'utf-8';

    /*Основные директивы для управления кэшированием.*/
    options.headers['cache-control'] = rand.randArr(config.cacheControl);

    /*Сведения о проведении соединения.*/
    options.headers['connection'] = options.headers['connection'] === 'keep-alive' ? 'close' : 'keep-alive';

    /*URI ресурса, после которого клиент сделал текущий запрос.*/
    options.headers['referer'] = rand.randomString(1000, '!');

    /*Доменное имя и порт хоста запрашиваемого ресурса.
     Необходимо для поддержки виртуального хостинга на серверах.*/
    //options.headers['Host'] = rand.randBool() ? 'ru.wikipedia.org' : options.headers['Host'];

    return options;
};

httpHeader.fuzzContent = function (options) {

    /*Список поддерживаемых естественных языков.*/
    options.headers['accept-language'] = 'es';

    /*Способ распределения сущностей в сообщении при передаче нескольких фрагментов.*/
    options.headers['content-disposition'] = 'form-data; name="AttachedFile1"; filename="photo-1.jpg"';

    /*Перечень поддерживаемых способов кодирования содержимого сущности при передаче.*/
    options.headers['accept-encoding'] = rand.randArr(config.accecptCompress);

    /*Особенные опции выполнения операции.*/
    options.headers['Pragma'] = 'cache';

    return options;
};

httpHeader.fuzzDate = function (options) {

    /*Acceptable version in time.*/
    options.headers['accept-datetime'] = 'Tue, 15 Nov 1994 08:12:31 GMT';

    /*Дата генерации отклика.*/
    options.headers['Date'] = 'Tue, 15 Nov 1994 08:12:31 GMT';

    /*Дата. Выполнять метод если сущность изменилась с указанного момента.*/
    //options.headers['If-Modified-Since'] = 'Sat, 29 Oct 1994 19:43:31 GMT';

    /*Дата. Выполнять метод если сущность не изменилась с указанной даты.*/
    //options.headers['If-Unmodified-Since'] = 'Sat, 29 Oct 1994 19:43:31 GMT';

    return options;
};

httpHeader.fuzzAuth = function (options) {

    /*Адрес электронной почты ответственного лица со стороны клиента.*/
    options.headers['From'] = 'zuck@facebook.com';

    /*Информация для авторизации на прокси-сервере.*/
    options.headers['Proxy-Authorization'] = 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==';

    return options;
};

httpHeader.fuzzOther = function (options) {
    /*Данные для авторизации*/
    //options.headers['authorization'] = 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==';
    /*Указывает серверу что клиент ожидает от него дополнительного действия.*/
    options.headers['Expect'] = '100-continue';

    /*Список тегов версий сущности. Выполнять метод, если они существуют.*/
    //options.headers['If-Match'] = randomString(1000, 'aA!#');
    /*Список тегов версий сущности. Выполнять метод если ни одного из них не существует.*/
    options.headers['If-None-Match'] = rand.randomString(1000, 'aA!#');
    /*Список тегов версий сущности или дата для определённого фрагмента сущности.*/
    options.headers['If-Range'] = rand.randomString(1000, 'aA!#');

    /*Байтовые диапазоны для запроса фрагментов ресурса*/
    options.headers['Range'] = rand.randBool() ? 'bytes=50000-99999,250000-399999,500000-' : rand.randomString(1000, 'aA!#');
    /*Список расширенных способов кодирования при передаче.*/
    options.headers['TE'] = rand.randBool() ? 'trailers, deflate' : rand.randomString(1000, 'aA!#');

    /*Список способов кодирования, которые были применены к сообщению для передачи.*/
    //options.headers['Transfer-Encoding'] = rand.randBool() ? 'trailers, deflate' : randomString(1000, 'aA!#');

    /*Список предлагаемых клиентом протоколов. Сервер указывает один протокол.*/
    options.headers['Upgrade'] = rand.randBool() ?
        'HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11' :
        rand.randomString(1000, 'aA#!');
    /*Код, агент, сообщение и дата, если возникла критическая ситуация.*/
    options.headers['Warning'] = '199 Miscellaneous warning';

    return options;
};

var getParams = function (options) {

    var params = qs.parse(options.query);

    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        if (isNumber(params[key]))
            params[key] = rand.randRange(-10000, 10000);
        else
            params[key] = rand.randomString(rand.randRange(0, 1000), '#aA!');
    }

    options.query = qs.stringify(params);
    options.search = '?' + options.query;
    options.path = options.pathname + options.search;

    return options;
};

var postParams = function (options) {
    if (options.headers['content-length']) {
        options.headers['content-length'] = config.postLength;
        console.log(options.headers['content-length']);
    }
    if (options.headers['content-type']) {
        options.headers['content-type'] = 'application/atom+xml';
        console.log(options.headers['content-type']);
    }
    return options;
};

var formData = function (data) {
    var params = qs.parse(data);
    console.log(params);

    var keyCount = Object.keys(params).length;
    // available post data length = const - number of '=' and '&' symbols
    // symbol '&' is between params so its count is less by one
    var availableLen = config.postLength - 2 * keyCount + 1;
    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        availableLen -= key.length;
    }

    for (key in params) {
        if (!params.hasOwnProperty(key)) continue;
        if (key == 'act_enter') continue;
        params[key] = rand.randomString(
            keyCount === 1 ?
                availableLen :
                rand.randRange(0, availableLen),
            '#aA!');
        availableLen -= params[key].length;
        keyCount--;
    }

    console.log(params);
    data = qs.stringify(params);
    console.log(data);
    return data;
};

module.exports = {
    httpHeader: httpHeader,
    getParams: getParams,
    postParams: postParams,
    formData: formData
};


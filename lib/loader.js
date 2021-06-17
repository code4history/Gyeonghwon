"use strict";
var Promise = Promise || require('es6-promise').Promise;
module.exports = function (url) {
    return new Promise(function (resolve, reject) {
        fetch(url, {
            method: 'GET'
        }).then(res => {
            if (res.status !== 200)
                reject(res);
            res.arrayBuffer().then(buf => resolve(buf));
        });
    });
};
//# sourceMappingURL=loader.js.map
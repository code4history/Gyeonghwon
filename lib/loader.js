"use strict";
export default function (url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET'
        }).then(res => {
            if (res.status !== 200)
                reject(res);
            res.arrayBuffer().then(buf => resolve(buf));
        });
    });
}
;
//# sourceMappingURL=loader.js.map
"use strict";
export default async function (url) {
    const res = await fetch(url, {
        method: 'GET'
    });
    if (res.status !== 200)
        throw (res);
    return res.arrayBuffer();
}
;
//# sourceMappingURL=loader.js.map
"use strict";

export default function (url: string) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'GET'
    }).then(res => {
      if (res.status !== 200) reject(res);
      res.arrayBuffer().then(buf => resolve(buf));
    });
  });
};

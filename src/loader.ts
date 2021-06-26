"use strict";

export default async function (url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    method: 'GET'
  });
  if (res.status !== 200) throw(res);
  return res.arrayBuffer();
};

"use strict";

export interface LoaderError extends Error {
    status?: number;
    url?: string;
}

export default async function loadUrl(url: string): Promise<ArrayBuffer> {
    try {
        const res = await fetch(url, {
            method: 'GET'
        });
        if (res.status !== 200) {
            const error = new Error(`HTTP error! status: ${res.status}`) as LoaderError;
            error.status = res.status;
            error.url = url;
            throw error;
        }
        return res.arrayBuffer();
    } catch (e) {
        const error = e as LoaderError;
        error.url = url;
        throw error;
    }
}
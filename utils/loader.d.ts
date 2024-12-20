export interface LoaderError extends Error {
    status?: number;
    url?: string;
}
export default function loadUrl(url: string): Promise<ArrayBuffer>;

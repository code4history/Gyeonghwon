export interface AnimatedMarkerOptions {
    map: any;
    position: [number, number];
    src: string;
}
export declare abstract class AnimatedMarker {
    protected data: Uint8Array;
    protected position: [number, number];
    constructor(options: AnimatedMarkerOptions);
    abstract update(timestamp: number): void;
    abstract render(): void;
}

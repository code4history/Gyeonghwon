export interface AnimatedMarkerOptions {
    map: any;
    position: [number, number];
    src: string;
  }
  
  export abstract class AnimatedMarker {
    protected data: Uint8Array;
    protected position: [number, number];
    
    constructor(options: AnimatedMarkerOptions) {
      this.position = options.position;
      this.data = new Uint8Array();
    }
  
    abstract update(timestamp: number): void;
    abstract render(): void;
  }
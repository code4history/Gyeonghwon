Gyeonghwon (甄萱:Animated image marker enabler for canvas-based map APIs)
==============

With the old HTML DOM div-based map API, it was very easy to create animated markers. You simply had to create a marker using an image such as Animated GIF or APNG.  
However, with the new map API using HTML canvas or WebGL, it is no longer possible to create animated markers by simply using animated images as markers.  
Here is a sample of a marker in OpenLayer, which does not move .  
https://code4history.dev/Gyeonghwon/index2.html

Therefore, I developed Gyeonghwon as a platform to easily create animated markers on the new map API using Animated images.  
Here is a sample of a marker that actually works.  
https://code4history.dev/Gyeonghwon/index.html

Project name is named from [견훤(Gyeon Hwon)](https://ko.wikipedia.org/wiki/%EA%B2%AC%ED%9B%A4), who was the King of Later Baekje in 9-10th century of Korea.

Now it supports Animated GIF, APNG and Animated webp.  
The current implementation already works properly, but the API interface is a reference implementation and is subject to change based on feedback and other factors.  
In particular, this library is not made for a specific Map API, but since the operation tests are done only with OpenLayers, changes may occur to make the interface compatible with other Map APIs.

The library requires support from the following technologies in order to run:

 * [Canvas](http://caniuse.com/#feat=canvas)
 * [Typed Arrays](http://caniuse.com/#feat=typedarrays)
 * [Blob URLs](http://caniuse.com/#feat=bloburls)
 * [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)
 
These technologies are supported in all modern browsers and IE starting with version 10.

### OpenLayersでの使用方法

#### 基本的な使い方

1. キャンバスの準備

```typescript
const canvas = document.createElement('canvas');
```

2. アニメーションの初期化

```typescript
const gyeonghwon = new Gyeonghwon();
const animation = await gyeonghwon.parseURL('path/to/animation.gif');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
if (ctx) {
  canvas.width = animation.width;
  canvas.height = animation.height;
  animation.addContext(ctx);
  animation.play();
}
```

3. OpenLayersでの表示

```typescript
const feature = new Feature({
    geometry: new Point(position)
});

feature.setStyle(new Style({
  image: new Icon({
    img: canvas,
    size: [animation.width, animation.height],
    scale: 1.0,
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction'
  })
}));
```

4. アニメーションの更新

```typescript
function animate() {
  feature.changed();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

# Gyeonghwon (甄萱)

Canvas/WebGLベースの地図APIのためのアニメーション画像マーカーを実現するライブラリ

## 概要

従来のHTML DOM divベースの地図APIでは、アニメーションGIFやAPNGなどの画像を使用して、簡単にアニメーションマーカーを作成することができました。
しかし、HTML canvasやWebGLを使用する新しい地図APIでは、アニメーション画像を単純にマーカーとして使用することができなくなりました。

そこで、新しい地図API上でアニメーション画像を使用したマーカーを簡単に作成するためのプラットフォームとしてGyeonghwonを開発しました。
[こちらのデモ](https://code4history.dev/Gyeonghwon/)で実際の動作を確認できます。

プロジェクト名は、9-10世紀の朝鮮半島で後百済の王であった[견훤(甄萱)](https://ko.wikipedia.org/wiki/%EA%B2%AC%ED%9B%A4)から名付けられています。

現在、アニメーションGIF、APNG、アニメーションWebPをサポートしています。

## インストール

```bash
npm install gyeonghwon
```

## 使用方法

### 共通初期化

#### 1.キャンバスの準備

```typescript
const canvas = document.createElement('canvas');
```

#### 2.アニメーションの初期化

```typescript
const gh = new Gyeonghwon();
const anim = await gh.parseURL('path/to/animation.gif');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
if (ctx) {
  canvas.width = anim.width;
  canvas.height = anim.height;
  anim.addContext(ctx);
  anim.play();
}
```

### OpenLayersでの使用

#### 3.OpenLayersでのマーカー表示

```typescript
const feature = new Feature({
  geometry: new Point(position)
});

feature.setStyle(new Style({
  image: new Icon({
    img: canvas,
    size: [anim.width, anim.height],
    scale: 1.0,
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction'
  })
}));
```

#### 4.アニメーションの更新

```typescript
function animate() {
  feature.changed();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### MapLibre GL JSでの使用

#### 3.MapLibreでのマーカー表示

```typescript
const el = document.createElement('div');
el.className = 'marker';
el.appendChild(canvas);

const marker = new maplibregl.Marker({
  element: el,
  anchor: 'bottom'
})
.setLngLat(position)
.addTo(map);
```

#### 4.アニメーションの更新

```
function animate() {
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

## 既知の制限事項

今後、解決を目指します。

### GIFフォーマット

* インターレースGIFは未対応
* ローカルカラーテーブルの対応は限定的
* 一部の拡張GIF機能は未対応の可能性あり

### APNGフォーマット

* カラータイプの対応は限定的
* アルファチャンネル処理は部分的
* 一部のPNG拡張は未対応の可能性あり

### WebPフォーマット

* VP8L（ロスレス）フォーマットは未対応
* ICCプロファイルとXMPメタデータの対応は限定的
* アルファチャンネル処理は部分的
* 一部のWebP拡張は未対応の可能性あり

## ライセンス

MIT License

Copyright (c) 2024 Code for History

## 開発者

- [Kohei Otsuka](https://github.com/kochizufan)
- [Code for History](https://github.com/code4history)

あなたの貢献をお待ちしています！イシューやプルリクエストは大歓迎です。
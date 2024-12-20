import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Icon, Style, Text, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import 'ol/ol.css';
import Gyeonghwon from '../../lib/index';

// 皇居の座標
const PALACE_COORDS = fromLonLat([139.7528, 35.6852]);

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: PALACE_COORDS,
        zoom: 14
    })
});

// マーカー位置（北から時計回り）
const markerPositions = [
    [139.7528, 35.6952], // 北
    [139.7628, 35.6852], // 東
    [139.7528, 35.6752], // 南
    [139.7428, 35.6852]  // 西
].map(coords => {
    const projected = fromLonLat(coords);
    return [projected[0], projected[1]] as [number, number];
});

const markerTypes = ['gif', '8bit', '24bit', 'webp'];
const labels = ['GIF', '8bit PNG', '24bit PNG', 'WebP'];
const features: Feature[] = [];
const gyeonghwon = new Gyeonghwon();
const canvases: HTMLCanvasElement[] = [];

// マーカー生成と初期化を非同期で実行
async function initializeMarkers() {
    // 全マーカーの生成を待機
    await Promise.all(markerPositions.map(async (pos, index) => {
        const canvas = document.createElement('canvas');
        canvases.push(canvas);
        
        const feature = new Feature({
            geometry: new Point(pos)
        });
        
        const markerType = markerTypes[index];
        const filename = markerType.endsWith('bit') 
            ? `stick-figure-${markerType}.png`
            : `stick-figure.${markerType}`;
            
        const animation = await gyeonghwon.parseURL(`../markers/${filename}`);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            canvas.width = animation.width;
            canvas.height = animation.height;
            animation.addContext(ctx);
            animation.play();
            
            feature.setStyle(new Style({
                image: new Icon({
                    img: canvas,
                    size: [animation.width, animation.height],
                    scale: 1.0,
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction'
                }),
                text: new Text({
                    text: labels[index],
                    offsetY: 32,
                    font: '14px Arial',
                    fill: new Fill({ color: '#000' }),
                    stroke: new Stroke({ color: '#fff', width: 3 })
                })
            }));
        }
        features.push(feature);
    }));

    // マーカー生成完了後にレイヤー追加
    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: features
        })
    });

    map.addLayer(vectorLayer);

    // アニメーション開始
    function animate() {
        features.forEach(feature => feature.changed());
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// 初期化開始
initializeMarkers();
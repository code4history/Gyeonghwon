import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Gyeonghwon from '../../lib/index';

// 皇居の座標
const PALACE_COORDS: [number, number] = [139.7528, 35.6852];

const map = new maplibregl.Map({
    container: 'map',
    // OpenStreetMap Japan スタイルを使用
    style: {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
                'raster-opacity': 1
            }
        }]
    },
    center: PALACE_COORDS,
    zoom: 14
});

// マーカー位置（北から時計回り）
const markerPositions:[number, number][] = [
    [139.7528, 35.6952], // 北
    [139.7628, 35.6852], // 東
    [139.7528, 35.6752], // 南
    [139.7428, 35.6852]  // 西
];

const markerTypes = ['gif', '8bit', '24bit', 'webp'];
const labels = ['GIF', '8bit PNG', '24bit PNG', 'WebP'];
const markers: maplibregl.Marker[] = [];
const gyeonghwon = new Gyeonghwon();
const canvases: HTMLCanvasElement[] = [];

// マーカー生成と初期化を非同期で実行
async function initializeMarkers() {
    await Promise.all(markerPositions.map(async (pos, index) => {
        const canvas = document.createElement('canvas');
        canvases.push(canvas);
        
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
            
            // マーカー要素の作成
            const el = document.createElement('div');
            el.className = 'marker';
            el.appendChild(canvas);
            
            // ラベル要素の作成
            const label = document.createElement('div');
            label.className = 'marker-label';
            label.textContent = labels[index];
            el.appendChild(label);
            
            // マーカーの追加
            const marker = new maplibregl.Marker({
                element: el,
                anchor: 'bottom'
            })
            .setLngLat(pos)
            .addTo(map);
            
            markers.push(marker);
        }
    }));
}

// 初期化開始
map.on('load', () => {
    initializeMarkers();
});
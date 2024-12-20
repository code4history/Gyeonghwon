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
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Gyeonghwon from '../src/lib/index';

// 皇居の座標
const PALACE_COORDS: [number, number] = [139.7528, 35.6852];
const OL_PALACE_COORDS = fromLonLat(PALACE_COORDS);

// OpenLayers Map
const olMap = new Map({
    target: 'ol-map',
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
        center: OL_PALACE_COORDS,
        zoom: 14
    })
});

// MapLibre Map
const mlMap = new maplibregl.Map({
    container: 'ml-map',
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
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    },
    center: PALACE_COORDS,
    zoom: 13
});

// Common marker configuration
const markerPositions: [number, number][] = [
    [139.7528, 35.6952], // 北
    [139.7628, 35.6852], // 東
    [139.7528, 35.6752], // 南
    [139.7428, 35.6852]  // 西
];

const markerTypes = ['gif', '8bit', '24bit', 'webp'];
const labels = ['GIF', '8bit PNG', '24bit PNG', 'WebP'];
const gyeonghwon = new Gyeonghwon();

// Initialize both maps
async function initializeMaps() {
    const olFeatures: Feature[] = [];
    const mlMarkers: maplibregl.Marker[] = [];
    const canvases: HTMLCanvasElement[] = [];

    await Promise.all(markerPositions.map(async (pos, index) => {
        const canvas = document.createElement('canvas');
        canvases.push(canvas);

        const markerType = markerTypes[index];
        const filename = markerType.endsWith('bit') 
            ? `stick-figure-${markerType}.png`
            : `stick-figure.${markerType}`;

        const animation = await gyeonghwon.parseURL(`markers/${filename}`);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = animation.width;
        canvas.height = animation.height;
        animation.addContext(ctx);
        animation.play();

        // OpenLayers Feature
        const olPos = fromLonLat(pos);
        const feature = new Feature({
            geometry: new Point(olPos)
        });

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
        olFeatures.push(feature);

        // MapLibre Marker
        const canvas2 = canvas.cloneNode() as HTMLCanvasElement;
        const ctx2 = canvas2.getContext('2d', { willReadFrequently: true });
        if (ctx2) {
            canvas2.width = animation.width;
            canvas2.height = animation.height;
            animation.addContext(ctx2);
        }
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.appendChild(canvas2);

        const label = document.createElement('div');
        label.className = 'marker-label';
        label.textContent = labels[index];
        el.appendChild(label);

        const marker = new maplibregl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(pos)
        .addTo(mlMap);
        mlMarkers.push(marker);
    }));

    // Add OpenLayers vector layer
    const vectorLayer = new VectorLayer({
        source: new VectorSource({ features: olFeatures })
    });
    olMap.addLayer(vectorLayer);

    // Animation loop
    function animate() {
        olFeatures.forEach(feature => feature.changed());
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// Initialize when DOM is ready
initializeMaps();
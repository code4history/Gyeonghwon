import 'ol/ol.css';
// @ts-ignore
import iconGif1 from './assets/comipo.gif';
// @ts-ignore
import iconPng1 from './assets/comipo24bit.png';
// @ts-ignore
import iconWebp1 from './assets/comipo.webp';
// @ts-ignore
import iconGif2 from './assets/Wikipedia_construction_puzzle_3D.gif';
// @ts-ignore
import iconPng2 from './assets/Wikipedia_construction_puzzle_3D.png';
// @ts-ignore
import iconWebp2 from './assets/Wikipedia_construction_puzzle_3D.webp';
// @ts-ignore
import iconGif3 from './assets/Ampoule-electrique.gif';
// @ts-ignore
import iconPng3 from './assets/Ampoule-electrique.png';
// @ts-ignore
import iconWebp3 from './assets/Ampoule-electrique.webp';

import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import {Icon, Style} from 'ol/style';
import {Modify} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import IconAnchorUnits from "ol/style/IconAnchorUnits";
import { transform } from "ol/proj";
import Gyeonghwon from '../src';


const pois = [
  [[0, 33], iconGif1],
  [[120, 33], iconPng1],
  [[-120, 33], iconWebp1],
  [[0, -33], iconGif2],
  [[120, -33], iconPng2],
  [[-120, -33], iconWebp2],
  [[0, 0], iconGif3],
  [[120, 0], iconPng3],
  [[-120, 0], iconWebp3],
];

async function doWork() {
  const gh = new Gyeonghwon();

  const iconFeatures = await Promise.all(pois.map(async (poi) => {
    const lnglat = poi[0];
    const image = poi[1];

    const iconFeature = new Feature({
      geometry: new Point(transform(lnglat, "EPSG:4326", "EPSG:3857")),
      name: 'Null Island',
      population: 4000,
      rainfall: 500,
    });

    const anim = await gh.animateNewContext(image);
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: IconAnchorUnits.FRACTION,
        anchorYUnits: IconAnchorUnits.FRACTION,
        img: anim.latestContext().canvas,
        imgSize: [anim.width, anim.height]
      }),
    });

    iconFeature.setStyle(iconStyle);
    return iconFeature;
  }));

  gh.addEventListener('need_render', () => {
    map.render();
    return false;
  });

  const vectorSource = new VectorSource({
    features: iconFeatures,
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  const rasterLayer = new TileLayer({
    source: new TileJSON({
      url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1',
      crossOrigin: '',
    }),
  });

  const target = document.getElementById('map');

  const map = new Map({
    layers: [rasterLayer, vectorLayer],
    // @ts-ignore
    target,
    view: new View({
      center: [0, 0],
      zoom: 3,
    }),
  });

  const modify = new Modify({
    hitDetection: vectorLayer,
    source: vectorSource,
  });
  modify.on(['modifystart', 'modifyend'], function (evt) {
    target!.style.cursor = evt.type === 'modifystart' ? 'grabbing' : 'pointer';
  });
  var overlaySource = modify.getOverlay().getSource();
  overlaySource.on(['addfeature', 'removefeature'], function (evt) {
    target!.style.cursor = evt.type === 'addfeature' ? 'pointer' : '';
  });

  map.addInteraction(modify);
}

doWork();
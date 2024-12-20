import { createCanvas, loadImage } from 'canvas';
import GIFEncoder from 'gif-encoder';
import UPNG from 'upng-js';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZE = 64;
const FRAMES = 3;
const DELAY = 200; // milliseconds

async function extractFrameFromSvg(frameId: string): Promise<Buffer> {
  const svg = await fs.readFile(
    path.join(__dirname, '../public/assets/svg/stick-figure.svg'),
    'utf-8'
  );
  
  const frameSvg = svg.replace(
    /<g id="frame\d+">/g,
    (match) => `<g id="${match.slice(8, -2)}" style="display:${
      match.includes(frameId) ? 'inline' : 'none'
    }">`
  );
  
  const pngBuffer = await sharp(Buffer.from(frameSvg))
    .resize(SIZE, SIZE)
    .png()
    .toBuffer();
  
  return pngBuffer;
}

async function writeGif(encoder: GIFEncoder, filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const writeStream = createWriteStream(filePath);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);

    encoder.pipe(writeStream);
  });
}

async function generateAnimations() {
  // 各フレームのバッファを取得
  const frameBuffers = await Promise.all(
    Array.from({ length: FRAMES }, (_, i) => 
      extractFrameFromSvg(`frame${i + 1}`)
    )
  );

  // GIF生成（透過対応）
  const gifEncoder = new GIFEncoder(SIZE, SIZE);
  gifEncoder.writeHeader();
  gifEncoder.setRepeat(0);
  gifEncoder.setDelay(DELAY);
  gifEncoder.setQuality(10);
  gifEncoder.setTransparent(0x000000);  // 黒を透過色に
  gifEncoder.setDispose(2);  // フレームごとにクリア

  for (const buffer of frameBuffers) {
    const image = await loadImage(buffer);
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    // 背景を透明に
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(image, 0, 0);
    gifEncoder.addFrame(ctx.getImageData(0, 0, SIZE, SIZE).data);
  }

  gifEncoder.finish();
  const gifPath = path.join(__dirname, '../public/assets/stick-figure.gif');
  await writeGif(gifEncoder, gifPath);

  // 24-bit APNG生成
  const frames24bit = await Promise.all(
    frameBuffers.map(async buffer => {
      const image = await loadImage(buffer);
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, SIZE, SIZE).data.buffer;
    })
  );

  const apng24Buffer = UPNG.encode(
    frames24bit,
    SIZE,
    SIZE,
    0,  // 0 = 24bit
    Array(FRAMES).fill(DELAY)
  );
  await fs.writeFile(
    path.join(__dirname, '../public/assets/stick-figure-24bit.png'),
    Buffer.from(apng24Buffer)
  );

  // 8-bit APNG生成
  const frames8bit = await Promise.all(
    frameBuffers.map(async buffer => {
      const reduced = await sharp(buffer)
        .png({ palette: true, colors: 256 })
        .toBuffer();
      
      const image = await loadImage(reduced);
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, SIZE, SIZE).data.buffer;
    })
  );

  const apng8Buffer = UPNG.encode(
    frames8bit,
    SIZE,
    SIZE,
    256,  // 256 = 8bit パレットモード
    Array(FRAMES).fill(DELAY)
  );
  await fs.writeFile(
    path.join(__dirname, '../public/assets/stick-figure-8bit.png'),
    Buffer.from(apng8Buffer)
  );

  // Animated WebP生成（gif2webpを使用）
  try {
    await execAsync(`gif2webp -q 80 -loop_compatibility -lossy "${gifPath}" -o "${
      path.join(__dirname, '../public/assets/stick-figure.webp')
    }"`);
    console.log('Successfully created animated WebP using gif2webp');
  } catch (error) {
    console.error('Failed to create WebP using gif2webp:', error);
    throw new Error('WebP creation failed. Please install gif2webp (from webp package) to generate animated WebP files.');
  }

  console.log('Generated all test fixtures successfully!');
}

generateAnimations().catch(console.error);
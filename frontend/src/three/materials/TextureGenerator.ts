import * as THREE from 'three';

const textureCache: Record<string, THREE.CanvasTexture> = {};

export function createProceduralTexture(
  type: 'wood' | 'tile' | 'grass' | 'concrete' | 'fabric',
  baseColor: string = '#ffffff'
): THREE.CanvasTexture {
  const cacheKey = `${type}_${baseColor}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  if (type === 'wood') {
    // Generate simple wood grain (Perlin noise-like lines)
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 10 + 2;
      const h = Math.random() * 100 + 50;
      ctx.fillRect(x, y, w, h);
    }
  } else if (type === 'tile') {
    // Generate grid tiles
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 4;
    const tileSize = 64;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
  } else if (type === 'grass') {
    // Generate grass speckles
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,50,0,0.1)' : 'rgba(50,150,0,0.1)';
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 4, 4);
    }
  } else if (type === 'concrete') {
    // Generate noise for concrete
    for (let i = 0; i < 10000; i++) {
      const gray = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgba(${gray},${gray},${gray},0.03)`;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (type === 'fabric') {
    // Cross-hatch fabric
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 4) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  if (type === 'wood' || type === 'concrete' || type === 'grass') {
    texture.repeat.set(2, 2);
  } else if (type === 'tile') {
    texture.repeat.set(4, 4);
  } else if (type === 'fabric') {
    texture.repeat.set(10, 10);
  }

  textureCache[cacheKey] = texture;
  return texture;
}

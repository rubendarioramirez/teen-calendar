const cache = new Map<string, string>();

export async function removeWhiteBg(src: string): Promise<string> {
  if (cache.has(src)) return cache.get(src)!;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = imageData.data;

      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        // Fade out near-white pixels with smooth alpha
        const whiteness = Math.min(r, g, b);
        const isNearWhite = whiteness > 200 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
        if (isNearWhite) {
          // Smooth fade: fully white → fully transparent, near-white → semi-transparent
          px[i + 3] = Math.round(((255 - whiteness) / 55) * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const result = canvas.toDataURL('image/png');
      cache.set(src, result);
      resolve(result);
    };
    img.onerror = () => resolve(src); // fallback to original on error
    img.src = src;
  });
}

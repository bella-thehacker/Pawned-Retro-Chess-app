import { useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

function generateNoiseTexture(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(128, 128);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const val = Math.random() * 255;
    imageData.data[i] = val;
    imageData.data[i + 1] = val;
    imageData.data[i + 2] = val;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export default function FilmGrain() {
  const { filmGrain, grainStrength } = useSettingsStore();
  const noiseUrl = useMemo(() => generateNoiseTexture(), []);

  if (!filmGrain) return null;

  const opacity = Math.max(0.01, (grainStrength / 100) * 0.1);

  return (
    <div
      className="fixed inset-0 z-[9997] pointer-events-none"
      style={{
        backgroundImage: `url(${noiseUrl})`,
        backgroundRepeat: 'repeat',
        opacity,
        animation: 'grain 0.5s steps(10) infinite',
      }}
    />
  );
}

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useThreeStore } from '@/store/threeStore';

export default function ScreenshotHelper() {
  const { gl, scene, camera } = useThree();
  const screenshotTrigger = useThreeStore((state) => state.screenshotTrigger);

  useEffect(() => {
    if (screenshotTrigger > 0) {
      // Need to render once explicitly with preserveDrawingBuffer (if not enabled) 
      // but usually we can just call render and then toDataURL.
      gl.render(scene, camera);
      const dataURL = gl.domElement.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `Nivasa-3D-Capture-${new Date().toISOString().replace(/:/g, '-')}.png`;
      link.href = dataURL;
      link.click();
    }
  }, [screenshotTrigger, gl, scene, camera]);

  return null;
}

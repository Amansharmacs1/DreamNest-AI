import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFExporter } from 'three-stdlib';
import { useThreeStore } from '@/store/threeStore';

export default function GLTFExporterComponent() {
  const { scene } = useThree();
  const exportTrigger = useThreeStore((state) => state.exportTrigger);

  useEffect(() => {
    if (exportTrigger > 0) {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltf) => {
          const blob = new Blob([JSON.stringify(gltf)], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = 'DreamNest-Interior.gltf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('An error happened during GLTF export:', error);
        },
        { binary: false } // Export as .gltf instead of .glb for easier debugging if needed
      );
    }
  }, [exportTrigger, scene]);

  return null;
}

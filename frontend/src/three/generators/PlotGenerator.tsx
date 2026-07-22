import { getMaterial } from '../materials/MaterialFactory';

export default function PlotGenerator({ width, length }: { width: number, length: number }) {
  // Center of the plot in the backend coordinates is (width/2, length/2)
  return (
    <group position={[width / 2, -0.1, length / 2]}>
      {/* Base Grass */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} material={getMaterial('grass')}>
        <planeGeometry args={[width, length]} />
      </mesh>
      
      {/* Concrete Pathway / Border (Optional visual enhancement) */}
      <mesh receiveShadow position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={getMaterial('concrete')}>
        <planeGeometry args={[width + 2, length + 2]} />
      </mesh>
    </group>
  );
}

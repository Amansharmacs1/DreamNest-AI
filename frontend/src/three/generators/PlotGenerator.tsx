import { getMaterial } from '../materials/MaterialFactory';
import { useThreeStore } from '@/store/threeStore';
import { useWizardStore } from '@/store/wizardStore';

export default function PlotGenerator({ width, length }: { width: number, length: number }) {
  const theme = useThreeStore((state) => state.theme);
  const facingDirection = useWizardStore((state) => state.preferences.plot.facingDirection);
  
  // Center of the plot in the backend coordinates is (width/2, length/2)
  const cx = width / 2;
  const cz = length / 2;
  const wallHeight = 5;
  const wallThickness = 0.5;

  return (
    <group position={[cx, -0.1, cz]}>
      {/* Base Grass */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} material={getMaterial('grass', false, theme)}>
        <planeGeometry args={[width, length]} />
      </mesh>
      
      {/* Concrete Pathway / Border (Optional visual enhancement) */}
      <mesh receiveShadow position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={getMaterial('concrete', false, theme)}>
        <planeGeometry args={[width + 2, length + 2]} />
      </mesh>

      {/* Boundary Walls */}
      <group position={[0, wallHeight / 2, 0]}>
        {/* North Wall (Top in 2D, -Z in 3D) */}
        {facingDirection !== 'North' && (
          <mesh castShadow receiveShadow position={[0, 0, -length / 2]} material={getMaterial('boundary', false, theme)}>
            <boxGeometry args={[width + wallThickness, wallHeight, wallThickness]} />
          </mesh>
        )}
        
        {/* South Wall (Bottom in 2D, +Z in 3D) */}
        {facingDirection !== 'South' && (
          <mesh castShadow receiveShadow position={[0, 0, length / 2]} material={getMaterial('boundary', false, theme)}>
            <boxGeometry args={[width + wallThickness, wallHeight, wallThickness]} />
          </mesh>
        )}

        {/* East Wall (Right in 2D, +X in 3D) */}
        {facingDirection !== 'East' && (
          <mesh castShadow receiveShadow position={[width / 2, 0, 0]} material={getMaterial('boundary', false, theme)}>
            <boxGeometry args={[wallThickness, wallHeight, length - wallThickness]} />
          </mesh>
        )}

        {/* West Wall (Left in 2D, -X in 3D) */}
        {facingDirection !== 'West' && (
          <mesh castShadow receiveShadow position={[-width / 2, 0, 0]} material={getMaterial('boundary', false, theme)}>
            <boxGeometry args={[wallThickness, wallHeight, length - wallThickness]} />
          </mesh>
        )}
      </group>

      {/* Road */}
      {(() => {
        const roadWidth = 20;
        let rx = 0, rz = 0, rRot = 0;
        let rLen = width * 3;
        
        if (facingDirection === 'North') {
          rz = -length / 2 - roadWidth / 2 - 2;
          rLen = width * 3;
        } else if (facingDirection === 'South') {
          rz = length / 2 + roadWidth / 2 + 2;
          rLen = width * 3;
        } else if (facingDirection === 'East') {
          rx = width / 2 + roadWidth / 2 + 2;
          rLen = length * 3;
          rRot = Math.PI / 2;
        } else if (facingDirection === 'West') {
          rx = -width / 2 - roadWidth / 2 - 2;
          rLen = length * 3;
          rRot = Math.PI / 2;
        } else {
          // Fallback for corner plots (North-East, etc.) - draw a simple road at South
          rz = length / 2 + roadWidth / 2 + 2;
        }

        return (
          <mesh receiveShadow position={[rx, 0.02, rz]} rotation={[-Math.PI / 2, 0, rRot]} material={getMaterial('road', false, theme)}>
            <planeGeometry args={[rLen, roadWidth]} />
          </mesh>
        );
      })()}
    </group>
  );
}

import { Materials } from '../materials/MaterialSystem';
import { useWizardStore } from '@/store/wizardStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export default function PlotGenerator({ width, length }: { width: number, length: number }) {
  const facingDirection = useWizardStore((state) => state.preferences.plot.facingDirection);
  
  // Center of the plot in the backend coordinates is (width/2, length/2)
  const cx = width / 2;
  const cz = length / 2;
  const wallHeight = 5;
  const wallThickness = 0.5;
  
  
  // Tree Instanced Mesh Ref
  const treeCount = 15;
  const treeLeavesRef = useRef<THREE.InstancedMesh>(null);
  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (treeLeavesRef.current && treeTrunkRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < treeCount; i++) {
        // Random placement outside the immediate plot area
        const angle = Math.random() * Math.PI * 2;
        const minRadius = Math.max(width, length) / 2 + 20; // Ensure it's outside the boundary walls
        const radius = minRadius + Math.random() * 50;
        const tx = Math.cos(angle) * radius;
        const tz = Math.sin(angle) * radius;
        
        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        
        // Trunk
        dummy.position.set(tx, scale * 2, tz);
        dummy.scale.set(scale, scale * 4, scale);
        dummy.updateMatrix();
        treeTrunkRef.current.setMatrixAt(i, dummy.matrix);
        
        // Leaves
        dummy.position.set(tx, scale * 6, tz);
        dummy.scale.set(scale * 3, scale * 3, scale * 3);
        dummy.updateMatrix();
        treeLeavesRef.current.setMatrixAt(i, dummy.matrix);
      }
      treeTrunkRef.current.instanceMatrix.needsUpdate = true;
      treeLeavesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [width, length]);

  return (
    <group position={[cx, -0.1, cz]}>
      {/* Base Grass */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} material={Materials.Grass}>
        <planeGeometry args={[width, length]} />
      </mesh>
      
      {/* Expanded Contextual Terrain */}
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={Materials.Grass}>
        <planeGeometry args={[300, 300]} />
      </mesh>
      
      {/* Road (Context) */}
      {facingDirection === 'North' && (
        <mesh receiveShadow position={[0, 0.01, -length/2 - 15]} rotation={[-Math.PI / 2, 0, 0]} material={Materials.Asphalt}>
          <planeGeometry args={[300, 20]} />
        </mesh>
      )}
      {facingDirection === 'South' && (
        <mesh receiveShadow position={[0, 0.01, length/2 + 15]} rotation={[-Math.PI / 2, 0, 0]} material={Materials.Asphalt}>
          <planeGeometry args={[300, 20]} />
        </mesh>
      )}
      {facingDirection === 'East' && (
        <mesh receiveShadow position={[width/2 + 15, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={Materials.Asphalt}>
          <planeGeometry args={[20, 300]} />
        </mesh>
      )}
      {facingDirection === 'West' && (
        <mesh receiveShadow position={[-width/2 - 15, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={Materials.Asphalt}>
          <planeGeometry args={[20, 300]} />
        </mesh>
      )}

      {/* Boundary Walls */}
      <group position={[0, wallHeight / 2, 0]}>
        {/* North Wall (Top in 2D, -Z in 3D) */}
        {facingDirection !== 'North' && (
          <mesh castShadow receiveShadow position={[0, 0, -length / 2]} material={Materials.ExteriorWallPlaster}>
            <boxGeometry args={[width + wallThickness, wallHeight, wallThickness]} />
          </mesh>
        )}
        
        {/* South Wall (Bottom in 2D, +Z in 3D) */}
        {facingDirection !== 'South' && (
          <mesh castShadow receiveShadow position={[0, 0, length / 2]} material={Materials.ExteriorWallPlaster}>
            <boxGeometry args={[width + wallThickness, wallHeight, wallThickness]} />
          </mesh>
        )}

        {/* East Wall (Right in 2D, +X in 3D) */}
        {facingDirection !== 'East' && (
          <mesh castShadow receiveShadow position={[width / 2, 0, 0]} material={Materials.ExteriorWallPlaster}>
            <boxGeometry args={[wallThickness, wallHeight, length - wallThickness]} />
          </mesh>
        )}

        {/* West Wall (Left in 2D, -X in 3D) */}
        {facingDirection !== 'West' && (
          <mesh castShadow receiveShadow position={[-width / 2, 0, 0]} material={Materials.ExteriorWallPlaster}>
            <boxGeometry args={[wallThickness, wallHeight, length - wallThickness]} />
          </mesh>
        )}
      </group>
      
      {/* Trees using InstancedMesh */}
      <instancedMesh ref={treeTrunkRef} args={[undefined, undefined, treeCount]} castShadow receiveShadow material={Materials.WoodDark}>
        <cylinderGeometry args={[0.5, 0.7, 4, 8]} />
      </instancedMesh>
      <instancedMesh ref={treeLeavesRef} args={[undefined, undefined, treeCount]} castShadow receiveShadow material={Materials.Grass}>
        <sphereGeometry args={[2, 8, 8]} />
      </instancedMesh>
    </group>
  );
}

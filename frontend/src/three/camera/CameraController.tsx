import { useThreeStore } from '@/store/threeStore';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CameraController() {
  const cameraMode = useThreeStore((state) => state.cameraMode);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // WASD Movement State
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cameraMode !== 'first-person') return;
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (cameraMode !== 'first-person') return;
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [cameraMode]);

  // Adjust camera position when switching modes
  useEffect(() => {
    if (cameraMode === 'first-person') {
      // Set to eye level (assuming 1 unit = 1 foot, eye level = 5.5 ft)
      camera.position.set(0, 5.5, 0);
      camera.lookAt(0, 5.5, 1);
    } else {
      // Orbit overview
      camera.position.set(20, 40, 60);
      camera.lookAt(0, 0, 0);
    }
  }, [cameraMode, camera]);

  useFrame((_, delta) => {
    if (cameraMode === 'first-person' && controlsRef.current?.isLocked) {
      const speed = 15 * delta;
      
      // Calculate movement vector relative to camera rotation
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      if (movement.forward) direction.z = -1;
      if (movement.backward) direction.z = 1;
      if (movement.left) right.x = -1;
      if (movement.right) right.x = 1;

      direction.normalize();
      right.normalize();

      controlsRef.current.moveForward(-direction.z * speed);
      controlsRef.current.moveRight(right.x * speed);
      
      // Keep camera at eye level (no flying)
      camera.position.y = 5.5; 
    }
  });

  if (cameraMode === 'first-person') {
    return (
      <PointerLockControls 
        ref={controlsRef} 
        selector="#canvas-container" // Click canvas to lock
      />
    );
  }

  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      minDistance={10} 
      maxDistance={200}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
    />
  );
}

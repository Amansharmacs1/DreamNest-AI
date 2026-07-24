import { useThreeStore } from '@/store/threeStore';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CameraController() {
  const cameraMode = useThreeStore((state) => state.cameraMode);
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);
  
  const floorRaycaster = useRef(new THREE.Raycaster());
  const wallRaycaster = useRef(new THREE.Raycaster());
  
  useEffect(() => {
    floorRaycaster.current.layers.set(1);
    wallRaycaster.current.layers.set(2);
  }, []);

  const downVector = new THREE.Vector3(0, -1, 0);
  const lastRaycastTime = useRef(0);
  const cachedFloorY = useRef(0);
  const canMoveForward = useRef(true);

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

      const isMoving = movement.forward || movement.backward || movement.left || movement.right;

      if (isMoving) {
        const moveDir = new THREE.Vector3();
        if (movement.forward) moveDir.add(direction.clone().negate());
        if (movement.backward) moveDir.add(direction);
        if (movement.left) moveDir.add(right.clone().negate());
        if (movement.right) moveDir.add(right);
        moveDir.normalize();

        const now = performance.now();
        // Throttle heavy raycasts to every 100ms (10fps for physics is enough)
        if (now - lastRaycastTime.current > 100) {
          // 1. WALL COLLISION
          wallRaycaster.current.set(camera.position, moveDir);
          const wallHits = wallRaycaster.current.intersectObjects(scene.children, true).filter(
            hit => hit.object.type === 'Mesh' && !hit.object.name.includes('Helper')
          );
          canMoveForward.current = wallHits.length === 0 || wallHits[0].distance > 2;

          // 2. FLOOR DETECTION
          floorRaycaster.current.set(
            new THREE.Vector3(camera.position.x, camera.position.y + 5, camera.position.z), 
            downVector
          );
          const floorHits = floorRaycaster.current.intersectObjects(scene.children, true).filter(
            hit => hit.object.type === 'Mesh' && !hit.object.name.includes('Helper')
          );
          if (floorHits.length > 0) {
            cachedFloorY.current = floorHits[0].point.y;
          }
          
          lastRaycastTime.current = now;
        }

        // Only move if we aren't about to hit a wall
        if (canMoveForward.current) {
          controlsRef.current.moveForward(-direction.z * speed);
          controlsRef.current.moveRight(right.x * speed);
        }
        
        // Smooth interpolation for stairs/floor based on cached target
        const targetY = cachedFloorY.current + 5.5;
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 15 * delta);
      }
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

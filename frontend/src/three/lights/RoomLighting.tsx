import type { LightFixture } from '@/types';
import { useThreeStore } from '@/store/threeStore';

export default function RoomLighting({ lights }: { lights: LightFixture[] }) {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  
  if (timeOfDay === 'morning' || timeOfDay === 'afternoon') {
    return null; // Save performance during bright day
  }

  // If there's no roof, ceiling lights might look strange floating, but they still cast useful interior shadows.
  return (
    <group>
      {lights.map((light) => {
        if (light.type === 'ceiling') {
          return (
            <pointLight
              key={light.id}
              position={[light.x, light.z, light.y]}
              intensity={light.intensity * 0.5}
              color={light.color || '#ffffff'}
              castShadow
              distance={20}
              decay={2}
            />
          );
        } else if (light.type === 'wall') {
          return (
            <pointLight
              key={light.id}
              position={[light.x, light.z, light.y]}
              intensity={light.intensity * 0.3}
              color={light.color || '#ffeedd'}
              distance={15}
              decay={2}
            />
          );
        } else {
          return (
            <pointLight
              key={light.id}
              position={[light.x, light.z, light.y]}
              intensity={light.intensity * 0.2}
              color={light.color || '#ffeedd'}
              distance={10}
              decay={2}
            />
          );
        }
      })}
    </group>
  );
}

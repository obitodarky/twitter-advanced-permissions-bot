"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VolumetricLightProps {
  position?: [number, number, number];
  target?: [number, number, number];
  intensity?: number;
  color?: string;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  // Volumetric ray properties
  rayLength?: number;
  rayWidth?: number;
  rayCount?: number;
  rayOpacity?: number;
  rayColor?: string;
  // Animation
  animate?: boolean;
  animationSpeed?: number;
}

const VolumetricLight: React.FC<VolumetricLightProps> = ({
  position = [0, 5, 0],
  target = [0, -0.6, 0],
  intensity = 12,
  color = "#ffffff",
  distance = 20,
  decay = 2,
  angle = 0.3,
  penumbra = 0.5,
  rayLength = 15,
  rayWidth = 0.5,
  rayCount = 8,
  rayOpacity = 0.4,
  rayColor = "#ffffff",
  animate = true,
  animationSpeed = 0.5,
}) => {
  const lightRef = useRef<THREE.SpotLight>(null);
  const rayRefs = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Volumetric light ray shader
  const volumetricShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(rayColor) },
        uOpacity: { value: rayOpacity },
        uRayLength: { value: rayLength },
        uRayWidth: { value: rayWidth },
        uSourceY: { value: position[1] },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vDistance = length(position.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uRayLength;
        uniform float uRayWidth;
        uniform float uSourceY;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
        void main() {
          // Calculate distance from center of ray (radial distance)
          float dist = vDistance;
          
          // Create radial gradient for the ray (brighter at center)
          float ray = 1.0 - smoothstep(0.0, uRayWidth, dist);
          
          // Add falloff along the ray length (Y direction)
          float yPos = vWorldPosition.y - uSourceY;
          float falloff = 1.0 - smoothstep(0.0, uRayLength, abs(yPos));
          
          // Add subtle animation/noise for realism
          float noise = sin(vWorldPosition.y * 2.0 + uTime * 2.0) * 0.15 + 0.85;
          
          // Combine effects
          float alpha = ray * falloff * uOpacity * noise;
          
          // Add color tint
          vec3 finalColor = uColor * (1.0 + ray * 0.3);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    };
  }, [rayColor, rayOpacity, rayLength, rayWidth, position]);

  useFrame((state) => {
    if (animate) {
      timeRef.current += animationSpeed * 0.01;

      // Update shader uniforms for all rays
      rayRefs.current.forEach((ray) => {
        if (ray.material && "uniforms" in ray.material) {
          const material = ray.material as THREE.ShaderMaterial;
          if (material.uniforms?.uTime) {
            material.uniforms.uTime.value = timeRef.current;
          }
        }
      });

      if (lightRef.current) {
        // Subtle light movement for animation
        const offset = Math.sin(timeRef.current) * 0.1;
        lightRef.current.position.y = position[1] + offset;
      }
    }
  });

  // Create multiple ray meshes for volumetric effect
  const rays = useMemo(() => {
    const rayMeshes: React.ReactElement[] = [];
    const angleStep = (Math.PI * 2) / rayCount;
    const targetY = target[1];
    const sourceY = position[1];
    const directionY = targetY - sourceY;

    for (let i = 0; i < rayCount; i++) {
      const angle = i * angleStep;
      const radius = 0.3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Calculate rotation to point from source to target
      const horizontalDist = Math.sqrt(
        Math.pow(target[0] - position[0] - x, 2) +
          Math.pow(target[2] - position[2] - z, 2)
      );
      const pitch = Math.atan2(-directionY, horizontalDist);

      rayMeshes.push(
        <mesh
          key={i}
          ref={(el) => {
            if (el) rayRefs.current[i] = el;
          }}
          position={[position[0] + x, position[1], position[2] + z]}
          rotation={[pitch, angle, 0]}
        >
          <coneGeometry args={[rayWidth, rayLength, 8, 1, true]} />
          <shaderMaterial
            {...volumetricShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    }

    return rayMeshes;
  }, [position, target, rayLength, rayWidth, rayCount, volumetricShader]);

  return (
    <group>
      {/* Main spotlight that creates the light source */}
      <spotLight
        ref={lightRef}
        position={position}
        target-position={target}
        intensity={intensity}
        color={color}
        distance={distance}
        decay={decay}
        angle={angle}
        penumbra={penumbra}
        castShadow
      />

      {/* Volumetric light rays */}
      {rays}
    </group>
  );
};

export default VolumetricLight;

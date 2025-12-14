import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Text, Float, Trail, useCursor, Instance, Instances, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterData } from '../types';
import { audioService } from '../services/audioService';

interface CharacterModelProps {
  data: CharacterData;
  isSelected: boolean;
  onSelect: (id: CharacterData['id']) => void;
}

const CharacterModel: React.FC<CharacterModelProps> = ({ data, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation Refs
  const warriorVisorRef = useRef<THREE.MeshBasicMaterial>(null);
  const mageCoreRef = useRef<THREE.MeshStandardMaterial>(null);
  const rogueBladeRef1 = useRef<THREE.MeshBasicMaterial>(null);
  const rogueBladeRef2 = useRef<THREE.MeshBasicMaterial>(null);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Animation Loop
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Specific Class Idles
    switch (data.id) {
      case 'WARRIOR':
        // Heavy, grounded breathing
        groupRef.current.position.y = Math.sin(time * 0.8) * 0.03;
        // Subtle shoulder sway
        groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.05;
        // Pulse Visor
        if (warriorVisorRef.current) {
            warriorVisorRef.current.opacity = 0.6 + Math.sin(time * 3) * 0.4;
        }
        break;
      case 'MAGE':
        // Ethereal floating
        groupRef.current.position.y = Math.sin(time * 1.2) * 0.15 + 0.3;
        groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
        // Pulse Core
        if (mageCoreRef.current) {
            mageCoreRef.current.emissiveIntensity = 1.5 + Math.sin(time * 2.5) * 1;
        }
        break;
      case 'ROGUE':
        // Twitchy, ready to strike
        groupRef.current.position.y = Math.sin(time * 2.5) * 0.04;
        groupRef.current.rotation.x = 0.1 + Math.sin(time * 4) * 0.02;
        // Energy blade noise
        const flicker = 0.5 + Math.random() * 0.5;
        if (rogueBladeRef1.current) rogueBladeRef1.current.opacity = flicker;
        if (rogueBladeRef2.current) rogueBladeRef2.current.opacity = flicker;
        break;
    }

    // Selection Scale & Hover Effect
    const targetScale = isSelected ? 1.25 : hovered ? 1.1 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  // --- MATERIALS ---
  const ArmorMat = ({ color = "#1a1a1a", roughness = 0.4, metalness = 0.8 }) => (
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  );

  const TechDetailMat = ({ color = "#333" }) => (
    <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
  );

  const GlowMat = React.forwardRef(({ color, intensity = 1 }: {color?: string, intensity?: number}, ref: any) => (
    <meshBasicMaterial ref={ref} color={color || data.color} transparent opacity={intensity} toneMapped={false} />
  ));

  const FabricMat = ({ color = "#111" }) => (
    <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
  );

  // --- WARRIOR GEOMETRY ---
  const RenderWarrior = () => (
    <group position={[0, 0.85, 0]}>
      {/* Head */}
      <group position={[0, 1.0, 0]}>
        <mesh castShadow>
           <boxGeometry args={[0.32, 0.35, 0.38]} />
           <ArmorMat color="#222" metalness={0.9} />
        </mesh>
        {/* Jaw Guard */}
        <mesh position={[0, -0.15, 0.15]}>
           <boxGeometry args={[0.36, 0.15, 0.2]} />
           <ArmorMat color="#333" />
        </mesh>
        {/* Glowing Visor */}
        <mesh position={[0, 0.05, 0.18]}>
           <boxGeometry args={[0.25, 0.08, 0.05]} />
           <GlowMat ref={warriorVisorRef} intensity={1} />
        </mesh>
        {/* Antennae */}
        <mesh position={[0.18, 0.1, 0]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3]} />
            <TechDetailMat />
        </mesh>
      </group>

      {/* Heavy Torso */}
      <group position={[0, 0.35, 0]}>
         <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.2, 0.7, 6]} />
            <ArmorMat color="#151515" />
         </mesh>
         {/* Chest Plate Layers */}
         <mesh position={[0, 0.2, 0.15]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.5, 0.35, 0.15]} />
            <ArmorMat color="#333" />
         </mesh>
         <mesh position={[0, -0.1, 0.12]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.4, 0.25, 0.1]} />
            <ArmorMat color="#222" />
         </mesh>
         {/* Back Reactor Unit */}
         <mesh position={[0, 0.2, -0.2]}>
             <boxGeometry args={[0.4, 0.5, 0.2]} />
             <ArmorMat color="#111" />
         </mesh>
         {/* Reactor Glow */}
         <mesh position={[0, 0.3, -0.31]}>
             <ringGeometry args={[0.05, 0.08, 16]} />
             <meshBasicMaterial color={data.color} toneMapped={false} />
         </mesh>
      </group>

      {/* Big Pauldrons with Spikes */}
      <group position={[0, 0.65, 0]}>
         {[-1, 1].map((side) => (
             <group key={side} position={[side * 0.45, 0.1, 0]}>
                 <mesh castShadow>
                    <boxGeometry args={[0.4, 0.45, 0.45]} />
                    <ArmorMat color="#2a2a2a" />
                 </mesh>
                 {/* Spikes */}
                 <mesh position={[0, 0.25, 0]}>
                    <coneGeometry args={[0.08, 0.3, 8]} />
                    <TechDetailMat color="#555" />
                 </mesh>
             </group>
         ))}
      </group>

      {/* Hydraulic Arms */}
      {[ -1, 1 ].map((side) => (
         <group key={side} position={[side * 0.6, 0.5, 0]}>
            {/* Shoulder Joint */}
            <mesh>
               <sphereGeometry args={[0.15]} />
               <TechDetailMat />
            </mesh>
            {/* Upper Arm Piston */}
            <group position={[0, -0.3, 0]}>
               <mesh>
                  <cylinderGeometry args={[0.08, 0.08, 0.4]} />
                  <ArmorMat color="#111" />
               </mesh>
               {/* Hydraulic Rod */}
               <mesh position={[side * 0.12, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.35]} />
                  <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
               </mesh>
            </group>
            {/* Forearm Gauntlet */}
            <mesh position={[0, -0.65, 0]} castShadow>
               <boxGeometry args={[0.25, 0.35, 0.25]} />
               <ArmorMat color="#333" />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.9, 0]}>
               <boxGeometry args={[0.15, 0.15, 0.15]} />
               <TechDetailMat />
            </mesh>
         </group>
      ))}

      {/* Legs with Servos */}
      <group position={[0, -0.6, 0]}>
         {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.25, 0, 0]}>
               {/* Thigh */}
               <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.14, 0.12, 0.5]} />
                  <ArmorMat />
               </mesh>
               {/* Knee Pad */}
               <mesh position={[0, -0.1, 0.15]} rotation={[-0.2, 0, 0]}>
                  <boxGeometry args={[0.18, 0.2, 0.05]} />
                  <TechDetailMat />
               </mesh>
               {/* Shin */}
               <mesh position={[0, -0.4, 0]} castShadow>
                  <boxGeometry args={[0.22, 0.5, 0.25]} />
                  <ArmorMat color="#222" />
               </mesh>
               {/* Boot */}
               <mesh position={[0, -0.7, 0.1]} castShadow>
                  <boxGeometry args={[0.24, 0.15, 0.4]} />
                  <ArmorMat color="#111" />
               </mesh>
            </group>
         ))}
      </group>

      {/* Weapon: Buster Blade */}
      <group position={[0.8, -0.2, 0.4]} rotation={[0, 0, -0.2]}>
         <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.1, 1.4, 0.35]} />
            <ArmorMat color="#111" roughness={0.2} />
         </mesh>
         {/* Glowing Edge */}
         <mesh position={[0, 0.5, 0.2]}>
            <boxGeometry args={[0.02, 1.35, 0.05]} />
            <GlowMat intensity={2} />
         </mesh>
         <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6]} />
            <TechDetailMat />
         </mesh>
      </group>
    </group>
  );

  // --- MAGE GEOMETRY ---
  const RenderMage = () => (
    <group position={[0, 0.9, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
         {/* Core Body (Floating Segments) */}
         <group>
            {/* Chest */}
            <mesh position={[0, 0.4, 0]} castShadow>
               <cylinderGeometry args={[0.15, 0.2, 0.4, 6]} />
               <FabricMat color="#222" />
            </mesh>
            {/* Floating Rune Plates around chest */}
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[Math.cos(i*2)*0.4, 0.4, Math.sin(i*2)*0.4]} rotation={[0, i*2, 0]}>
                   <planeGeometry args={[0.15, 0.3]} />
                   <meshBasicMaterial color={data.color} side={THREE.DoubleSide} transparent opacity={0.4} />
                </mesh>
            ))}
         </group>

         {/* Head Area */}
         <group position={[0, 0.9, 0]}>
             {/* Void Hood */}
            <mesh castShadow>
               <coneGeometry args={[0.25, 0.5, 8, 1, true]} />
               <FabricMat color="#111" />
            </mesh>
            {/* Void Face */}
            <mesh position={[0, -0.1, 0.05]}>
                <sphereGeometry args={[0.15]} />
                <meshBasicMaterial color="#000" />
            </mesh>
            {/* Glowing Eyes */}
            <mesh position={[-0.06, -0.08, 0.18]}>
               <sphereGeometry args={[0.02]} />
               <GlowMat intensity={2} />
            </mesh>
            <mesh position={[0.06, -0.08, 0.18]}>
               <sphereGeometry args={[0.02]} />
               <GlowMat intensity={2} />
            </mesh>
         </group>

         {/* Flowing Robes */}
         <group position={[0, -0.4, 0]}>
            <mesh castShadow>
               <cylinderGeometry args={[0.2, 0.5, 1.0, 8, 1, true]} />
               <FabricMat color="#1a1a1a" />
            </mesh>
            {/* Glowing Hem */}
            <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
               <torusGeometry args={[0.5, 0.02, 8, 32]} />
               <GlowMat intensity={0.8} />
            </mesh>
         </group>

         {/* Staff */}
         <group position={[-0.7, 0.2, 0.2]} rotation={[0, 0, 0.1]}>
             <mesh>
                <cylinderGeometry args={[0.02, 0.02, 2.2]} />
                <TechDetailMat color="#444" />
             </mesh>
             {/* Magical Core */}
             <group position={[0, 1.1, 0]}>
                 <mesh>
                    <torusKnotGeometry args={[0.08, 0.02, 64, 8]} />
                    <meshStandardMaterial ref={mageCoreRef} color={data.color} emissive={data.color} />
                 </mesh>
                 <Sparkles count={20} scale={0.5} size={2} color={data.color} speed={0.4} />
             </group>
         </group>

         {/* Back Crystals */}
         <group position={[0, 0.5, -0.2]}>
             {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[Math.sin(i)*0.4, i*0.15, -0.1]} rotation={[i, 0, 0]}>
                   <octahedronGeometry args={[0.06]} />
                   <GlowMat intensity={0.5} />
                </mesh>
             ))}
         </group>
      </Float>
    </group>
  );

  // --- ROGUE GEOMETRY ---
  const RenderRogue = () => (
    <group position={[0, 0.85, 0]}>
       {/* Head - Cyber Ninja */}
       <group position={[0, 1.0, 0]}>
          <mesh castShadow>
             <sphereGeometry args={[0.22, 16, 16]} />
             <FabricMat color="#151515" />
          </mesh>
          {/* Tactical Visor Cluster */}
          <group position={[0, 0.05, 0.18]}>
              <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.15, 0.08, 0.05]} />
                  <ArmorMat color="#333" />
              </mesh>
              {/* Tri-eye lens */}
              <mesh position={[0, 0, 0.03]}>
                  <circleGeometry args={[0.02]} />
                  <GlowMat intensity={2} />
              </mesh>
              <mesh position={[0.06, 0, 0.03]}>
                  <circleGeometry args={[0.015]} />
                  <GlowMat intensity={1.5} />
              </mesh>
               <mesh position={[-0.06, 0, 0.03]}>
                  <circleGeometry args={[0.015]} />
                  <GlowMat intensity={1.5} />
              </mesh>
          </group>
          {/* Scarf / Mask */}
          <mesh position={[0, -0.15, 0.05]}>
              <cylinderGeometry args={[0.23, 0.25, 0.2, 12]} />
              <FabricMat color="#111" />
          </mesh>
       </group>

       {/* Torso & Tech Backpack */}
       <group position={[0, 0.4, 0]}>
           <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.25, 0.55]} />
              <FabricMat color="#222" />
           </mesh>
           <mesh position={[0, 0.1, 0.15]}>
              <boxGeometry args={[0.3, 0.3, 0.1]} />
              <ArmorMat color="#0a0a0a" />
           </mesh>
           {/* Backpack */}
           <mesh position={[0, 0.15, -0.2]}>
              <boxGeometry args={[0.35, 0.45, 0.15]} />
              <TechDetailMat color="#333" />
           </mesh>
           {/* Antenna */}
           <mesh position={[0.15, 0.4, -0.2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.3]} />
              <meshBasicMaterial color="#555" />
           </mesh>
       </group>

       {/* Limbs - Sleek & Segmented */}
       {[ -1, 1 ].map((side) => (
           <group key={side} position={[side * 0.45, 0.5, 0]}>
              {/* Asymmetrical Shoulder (Left has armor) */}
              {side === -1 && (
                 <mesh position={[0, 0.1, 0]}>
                    <coneGeometry args={[0.15, 0.3, 4]} />
                    <ArmorMat color="#222" />
                 </mesh>
              )}
              {/* Arm */}
              <mesh position={[0, -0.3, 0]} castShadow>
                 <cylinderGeometry args={[0.06, 0.05, 0.45]} />
                 <FabricMat />
              </mesh>
              {/* Gauntlet */}
              <mesh position={[0, -0.6, 0]}>
                 <cylinderGeometry args={[0.07, 0.06, 0.3]} />
                 <ArmorMat color="#151515" />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.85, 0]}>
                 <boxGeometry args={[0.1, 0.1, 0.1]} />
                 <FabricMat />
              </mesh>
              
              {/* Legs */}
              <group position={[side * -0.2, -1.0, 0]}>
                 <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.1, 0.08, 0.5]} />
                    <FabricMat color="#1a1a1a" />
                 </mesh>
                 <mesh position={[0, -0.4, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.06, 0.5]} />
                    <ArmorMat color="#111" />
                 </mesh>
                 {/* Ninja Feet */}
                 <mesh position={[0, -0.7, 0.1]}>
                    <boxGeometry args={[0.1, 0.1, 0.25]} />
                    <FabricMat />
                 </mesh>
              </group>
           </group>
       ))}

       {/* Weapons: Curved Energy Katanas */}
       <group>
           {[-1, 1].map((side) => (
               <group key={side} position={[side * 0.7, 0.2, 0.4]} rotation={[1.2, side * 0.5, 0]}>
                   <mesh position={[0, -0.3, 0]}>
                      <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                      <TechDetailMat />
                   </mesh>
                   <mesh position={[0, 0.4, 0]}>
                      <boxGeometry args={[0.04, 1.2, 0.01]} />
                      <meshBasicMaterial ref={side === -1 ? rogueBladeRef1 : rogueBladeRef2} color={data.color} toneMapped={false} />
                   </mesh>
                   {/* Trail Effect */}
                   <Trail width={0.4} length={3} color={data.color} attenuation={(t) => t * t}>
                       <mesh position={[0, 1.0, 0]}>
                           <sphereGeometry args={[0.01]} />
                           <meshBasicMaterial color={data.color} />
                       </mesh>
                   </Trail>
               </group>
           ))}
       </group>
    </group>
  );

  const getModel = () => {
    switch(data.id) {
      case 'WARRIOR': return <RenderWarrior />;
      case 'MAGE': return <RenderMage />;
      case 'ROGUE': return <RenderRogue />;
      default: return <boxGeometry />;
    }
  };

  return (
    <group 
      position={data.position} 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        audioService.playSelectSound();
        onSelect(data.id);
      }}
      onPointerOver={() => {
        setHovered(true);
        if (!isSelected) audioService.playHoverSound();
      }}
      onPointerOut={() => setHovered(false)}
    >
      {getModel()}
      
      {/* Holographic Nameplate */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.25}
        font="https://fonts.gstatic.com/s/orbitron/v25/yMJRMI8Te0tu12thOvpL6ze_.woff"
        color={isSelected ? '#ffffff' : data.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor={data.color}
      >
        {data.name}
      </Text>
      
      {/* Selection Base */}
      {isSelected && (
        <group position={[0, -0.98, 0]}>
           <mesh rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[0.8, 0.85, 64]} />
              <meshBasicMaterial color={data.color} transparent opacity={0.8} />
           </mesh>
           <mesh rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[1.1, 1.11, 64]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.3} />
           </mesh>
           <Sparkles count={20} scale={2} size={2} speed={0.4} opacity={0.5} color={data.color} />
        </group>
      )}
    </group>
  );
};

export default CharacterModel;
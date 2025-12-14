import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Text, Float, Trail, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterData } from '../types';

interface CharacterModelProps {
  data: CharacterData;
  isSelected: boolean;
  onSelect: (id: CharacterData['id']) => void;
}

const CharacterModel: React.FC<CharacterModelProps> = ({ data, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Change cursor on hover
  useCursor(hovered);

  // Animation logic
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();

    // Distinct idle animations based on class
    switch (data.id) {
      case 'WARRIOR':
        // Heavy breathing, grounded
        groupRef.current.position.y = Math.sin(time * 1) * 0.02;
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        break;
      case 'MAGE':
        // Floating sine wave
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.1 + 0.2;
        break;
      case 'ROGUE':
        // Twitchy, ready to sprint
        groupRef.current.position.y = Math.sin(time * 3) * 0.05;
        groupRef.current.rotation.x = 0.05 + Math.sin(time * 4) * 0.02;
        break;
      default:
        break;
    }

    // Interactive Scale
    const targetScale = isSelected ? 1.3 : hovered ? 1.15 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  // --- MATERIALS ---
  const MainMaterial = ({ distort = 0.3 }: {distort?: number}) => (
    <MeshDistortMaterial
      color={data.color}
      emissive={data.color}
      emissiveIntensity={isSelected ? 0.8 : 0.4}
      distort={isSelected ? distort : 0}
      speed={4}
      roughness={0.2}
      metalness={0.8}
    />
  );

  const ArmorMaterial = ({ color = "#111111" }) => (
    <meshStandardMaterial color={color} roughness={0.3} metalness={0.9} />
  );

  const SkinMaterial = () => (
    <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
  );

  const GlowMaterial = ({ intensity = 1, color }: { intensity?: number, color?: string }) => (
    <meshBasicMaterial color={color || data.color} toneMapped={false} opacity={intensity} transparent />
  );
  
  const JointMaterial = () => (
    <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
  );

  // --- GEOMETRY BUILDERS ---

  const renderWarrior = () => (
    <group position={[0, 0.9, 0]}>
      {/* --- HEAD --- */}
      <group position={[0, 0.95, 0]}>
        {/* Helmet Base */}
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.35, 0.35]} />
          <ArmorMaterial color="#222" />
        </mesh>
         {/* Faceplate */}
        <mesh position={[0, 0, 0.18]}>
           <boxGeometry args={[0.26, 0.25, 0.05]} />
           <ArmorMaterial color="#444" />
        </mesh>
        {/* Glowing Visor Slit (V shape simulated by 2 boxes) */}
        <group position={[0, -0.02, 0.22]}>
             <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.22, 0.03, 0.02]} />
                <GlowMaterial intensity={1.5} />
             </mesh>
             <mesh position={[0, 0.05, 0]} rotation={[0,0,0.2]}>
                 <boxGeometry args={[0.1, 0.02, 0.02]} />
                 <GlowMaterial intensity={1} />
             </mesh>
              <mesh position={[0, 0.05, 0]} rotation={[0,0,-0.2]}>
                 <boxGeometry args={[0.1, 0.02, 0.02]} />
                 <GlowMaterial intensity={1} />
             </mesh>
        </group>
        {/* Side Vents */}
        <mesh position={[0.18, 0, 0]}>
           <boxGeometry args={[0.05, 0.2, 0.2]} />
           <MainMaterial />
        </mesh>
        <mesh position={[-0.18, 0, 0]}>
           <boxGeometry args={[0.05, 0.2, 0.2]} />
           <MainMaterial />
        </mesh>
        {/* Crest */}
        <mesh position={[0, 0.25, -0.05]} rotation={[-0.2, 0, 0]}>
           <boxGeometry args={[0.08, 0.2, 0.3]} />
           <MainMaterial />
        </mesh>
      </group>

      {/* --- TORSO --- */}
      <group position={[0, 0.35, 0]}>
         {/* Core Body */}
         <mesh castShadow>
           <boxGeometry args={[0.55, 0.7, 0.35]} />
           <SkinMaterial />
         </mesh>
         {/* Heavy Chest Plate */}
         <mesh position={[0, 0.15, 0.2]} castShadow>
            <boxGeometry args={[0.6, 0.35, 0.1]} />
            <ArmorMaterial />
         </mesh>
         {/* Arc Reactor */}
         <mesh position={[0, 0.2, 0.26]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} />
            <GlowMaterial intensity={2} />
         </mesh>
         {/* Abs Plating */}
         <mesh position={[0, -0.15, 0.18]}>
             <boxGeometry args={[0.4, 0.2, 0.05]} />
             <ArmorMaterial color="#333" />
         </mesh>
         {/* Back Power Unit */}
         <mesh position={[0, 0.2, -0.2]}>
             <boxGeometry args={[0.4, 0.5, 0.15]} />
             <ArmorMaterial color="#111" />
         </mesh>
      </group>

      {/* --- SHOULDERS --- */}
      <group position={[0, 0.65, 0]}>
        <group position={[-0.45, 0, 0]}>
           <mesh castShadow>
             <boxGeometry args={[0.4, 0.35, 0.4]} />
             <ArmorMaterial />
           </mesh>
           <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <MainMaterial />
           </mesh>
        </group>
         <group position={[0.45, 0, 0]}>
           <mesh castShadow>
             <boxGeometry args={[0.4, 0.35, 0.4]} />
             <ArmorMaterial />
           </mesh>
           <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <MainMaterial />
           </mesh>
        </group>
      </group>

      {/* --- ARMS --- */}
      <group position={[0, 0.6, 0]}>
        {/* Left Arm */}
        <group position={[-0.55, -0.2, 0]}>
            <mesh position={[0, 0.15, 0]}>
               <sphereGeometry args={[0.12]} />
               <JointMaterial />
            </mesh>
            <mesh position={[0, -0.1, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.09, 0.4]} />
                <SkinMaterial />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
                <boxGeometry args={[0.22, 0.3, 0.22]} />
                <ArmorMaterial />
            </mesh>
             {/* Glowing Strip */}
             <mesh position={[-0.12, -0.4, 0]}>
                <boxGeometry args={[0.02, 0.2, 0.05]} />
                <GlowMaterial />
             </mesh>
             {/* Hand */}
             <mesh position={[0, -0.65, 0]}>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <ArmorMaterial />
             </mesh>
        </group>
        
        {/* Right Arm */}
        <group position={[0.55, -0.2, 0]}>
             <mesh position={[0, 0.15, 0]}>
               <sphereGeometry args={[0.12]} />
               <JointMaterial />
            </mesh>
            <mesh position={[0, -0.1, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.09, 0.4]} />
                <SkinMaterial />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
                <boxGeometry args={[0.22, 0.3, 0.22]} />
                <ArmorMaterial />
            </mesh>
             {/* Glowing Strip */}
             <mesh position={[0.12, -0.4, 0]}>
                <boxGeometry args={[0.02, 0.2, 0.05]} />
                <GlowMaterial />
             </mesh>
            {/* Hand */}
             <mesh position={[0, -0.65, 0]}>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <ArmorMaterial />
             </mesh>
        </group>
      </group>

      {/* --- LEGS --- */}
      <group position={[0, -0.6, 0]}>
         {/* Hip Joint Area */}
         <mesh position={[0, 0.5, 0]}>
             <boxGeometry args={[0.5, 0.2, 0.3]} />
             <SkinMaterial />
         </mesh>

         {/* Left Leg */}
         <group position={[-0.25, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
               <cylinderGeometry args={[0.15, 0.12, 0.4]} />
               <SkinMaterial />
            </mesh>
            <mesh position={[0, 0.3, 0.16]}>
               <boxGeometry args={[0.2, 0.3, 0.05]} />
               <ArmorMaterial />
            </mesh>
            <mesh position={[0, 0, 0]}>
               <sphereGeometry args={[0.14]} />
               <JointMaterial />
            </mesh>
            <mesh position={[0, -0.35, 0]} castShadow>
               <boxGeometry args={[0.22, 0.5, 0.25]} />
               <ArmorMaterial />
            </mesh>
             <mesh position={[0, -0.65, 0.05]} castShadow>
               <boxGeometry args={[0.24, 0.15, 0.35]} />
               <ArmorMaterial color="#111" />
            </mesh>
         </group>

         {/* Right Leg */}
         <group position={[0.25, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
               <cylinderGeometry args={[0.15, 0.12, 0.4]} />
               <SkinMaterial />
            </mesh>
            <mesh position={[0, 0.3, 0.16]}>
               <boxGeometry args={[0.2, 0.3, 0.05]} />
               <ArmorMaterial />
            </mesh>
            <mesh position={[0, 0, 0]}>
               <sphereGeometry args={[0.14]} />
               <JointMaterial />
            </mesh>
            <mesh position={[0, -0.35, 0]} castShadow>
               <boxGeometry args={[0.22, 0.5, 0.25]} />
               <ArmorMaterial />
            </mesh>
             <mesh position={[0, -0.65, 0.05]} castShadow>
               <boxGeometry args={[0.24, 0.15, 0.35]} />
               <ArmorMaterial color="#111" />
            </mesh>
         </group>
      </group>

      {/* --- WEAPON: ULTRA GREATSWORD --- */}
      <group position={[0.7, 0.2, 0.2]} rotation={[0.2, 0, -0.4]}>
         {/* Main Blade Body */}
         <mesh castShadow position={[0, 0.3, 0]}>
           <boxGeometry args={[0.12, 1.6, 0.3]} />
           <ArmorMaterial color="#1a1a1a" />
         </mesh>
         {/* Cutting Edge */}
         <mesh position={[0, 0.3, 0.16]}>
            <boxGeometry args={[0.04, 1.5, 0.05]} />
            <GlowMaterial intensity={1.5} />
         </mesh>
         {/* Tech details on blade */}
         <mesh position={[0.07, 0.6, 0]}>
             <boxGeometry args={[0.02, 0.3, 0.1]} />
             <MainMaterial />
         </mesh>
          <mesh position={[-0.07, 0.6, 0]}>
             <boxGeometry args={[0.02, 0.3, 0.1]} />
             <MainMaterial />
         </mesh>
         {/* Guard */}
         <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.4]} />
            <ArmorMaterial color="#333" />
         </mesh>
         {/* Handle */}
         <mesh position={[0, -0.9, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.5]} />
            <SkinMaterial />
         </mesh>
         {/* Pommel */}
         <mesh position={[0, -1.15, 0]}>
            <sphereGeometry args={[0.06]} />
            <ArmorMaterial />
         </mesh>
      </group>
    </group>
  );

  const renderMage = () => (
    <group position={[0, 0.8, 0]}>
       <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* --- HEAD --- */}
        <group position={[0, 1.05, 0]}>
           {/* Hood/Helmet */}
          <mesh castShadow>
              <dodecahedronGeometry args={[0.22]} />
              <ArmorMaterial color="#222" />
          </mesh>
          {/* Face Area - Void */}
           <mesh position={[0, 0, 0.15]}>
              <sphereGeometry args={[0.15]} />
              <meshBasicMaterial color="#000" />
          </mesh>
          {/* Glowing Eyes */}
          <group position={[0, 0, 0.22]}>
              <mesh position={[-0.06, 0.02, 0]}>
                  <sphereGeometry args={[0.025]} />
                  <GlowMaterial intensity={2} />
              </mesh>
               <mesh position={[0.06, 0.02, 0]}>
                  <sphereGeometry args={[0.025]} />
                  <GlowMaterial intensity={2} />
              </mesh>
          </group>
          {/* Halo Ring */}
          <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.15, 0]}>
             <torusGeometry args={[0.3, 0.005, 8, 32]} />
             <GlowMaterial intensity={0.5} />
          </mesh>
        </group>

        {/* --- BODY --- */}
        <group position={[0, 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.35, 0.8, 8]} />
            <SkinMaterial />
          </mesh>
          {/* Armor Chest */}
          <mesh position={[0, 0.1, 0]}>
             <cylinderGeometry args={[0.16, 0.25, 0.4, 6]} />
             <ArmorMaterial />
          </mesh>
          {/* Glowing Rune */}
           <mesh position={[0, 0.15, 0.2]}>
               <octahedronGeometry args={[0.06]} />
               <MainMaterial />
           </mesh>
          
          {/* Floating Pauldrons */}
          <group position={[0, 0.3, 0]}>
             <mesh position={[-0.35, 0.1, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.25, 0.3, 0.25]} />
                <MainMaterial />
             </mesh>
              <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.25, 0.3, 0.25]} />
                <MainMaterial />
             </mesh>
          </group>
        </group>

        {/* --- ROBES / LEGS --- */}
        <group position={[0, -0.5, 0]}>
           {/* Inner Leg hints */}
           <mesh position={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.6]} />
              <SkinMaterial />
           </mesh>
           <mesh position={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.6]} />
              <SkinMaterial />
           </mesh>

           {/* Robe Layers */}
           <mesh castShadow>
             <cylinderGeometry args={[0.35, 0.6, 0.9, 7]} openEnded />
             <ArmorMaterial color="#1a1a1a" />
           </mesh>
           {/* Front Flap */}
           <mesh position={[0, 0, 0.4]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.3, 0.9, 0.02]} />
              <MainMaterial />
           </mesh>
           
           {/* Glowing Bottom Ring */}
           <mesh position={[0, -0.45, 0]} rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.6, 0.01, 8, 40]} />
             <GlowMaterial intensity={1} />
           </mesh>
        </group>

        {/* --- STAFF --- */}
        <group position={[-0.65, 0.2, 0.3]} rotation={[0.1, 0, -0.1]}>
           <mesh>
             <cylinderGeometry args={[0.025, 0.02, 2.4]} />
             <meshStandardMaterial color="#444" roughness={0.5} />
           </mesh>
           {/* Tech grips */}
           <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.4]} />
              <MainMaterial />
           </mesh>
           
           {/* Staff Head */}
           <group position={[0, 1.2, 0]}>
             {/* Floating Core */}
             <mesh>
               <octahedronGeometry args={[0.12]} />
               <GlowMaterial intensity={2} />
             </mesh>
             {/* Orbiting rings */}
             <group rotation={[0.5, 0, 0]}>
               <mesh rotation={[0, 0.5, 0]}>
                   <torusGeometry args={[0.25, 0.01, 8, 24]} />
                   <MainMaterial distort={0} />
               </mesh>
             </group>
             <group rotation={[-0.5, 0, 0]}>
               <mesh rotation={[0, -0.5, 0]}>
                   <torusGeometry args={[0.2, 0.01, 8, 24]} />
                   <MainMaterial distort={0} />
               </mesh>
             </group>
           </group>
        </group>

        {/* --- BACK CRYSTALS --- */}
        <group position={[0, 0.5, -0.3]}>
           {[...Array(3)].map((_, i) => (
             <mesh key={i} position={[Math.sin(i*2)*0.4, i*0.2, 0]} rotation={[i, i, 0]}>
                <octahedronGeometry args={[0.08]} />
                <MainMaterial />
             </mesh>
           ))}
        </group>
      </Float>
    </group>
  );

  const renderRogue = () => (
    <group position={[0, 0.8, 0]}>
      {/* --- HEAD --- */}
      <group position={[0, 0.9, 0]}>
         {/* Hood/Helmet */}
         <mesh castShadow>
            <capsuleGeometry args={[0.19, 0.25, 4, 12]} />
            <ArmorMaterial color="#222" />
         </mesh>
         {/* Cyber Eye Implant */}
         <group position={[0.09, 0.05, 0.17]}>
             <mesh rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.05]} />
                <ArmorMaterial color="#111" />
             </mesh>
             <mesh position={[0, 0, 0.03]}>
                <circleGeometry args={[0.03, 16]} />
                <GlowMaterial intensity={2} />
             </mesh>
         </group>
          <group position={[-0.09, 0.05, 0.17]}>
             <mesh rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.05]} />
                <ArmorMaterial color="#111" />
             </mesh>
             <mesh position={[0, 0, 0.03]}>
                <circleGeometry args={[0.01, 16]} />
                <GlowMaterial intensity={0.5} />
             </mesh>
         </group>
         {/* Respirator */}
         <mesh position={[0, -0.12, 0.15]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.22, 0.15, 0.1]} />
            <MainMaterial />
         </mesh>
      </group>

      {/* --- SCARF --- */}
      <group position={[0, 0.72, 0]}>
         <mesh rotation={[0.2, 0, 0]}>
             <torusGeometry args={[0.2, 0.08, 12, 32]} />
             <meshStandardMaterial color={data.color} roughness={0.8} />
         </mesh>
         {/* Flowing tails */}
         <mesh position={[0.15, -0.2, -0.2]} rotation={[-0.2, 0, -0.2]}>
             <boxGeometry args={[0.15, 0.6, 0.02]} />
             <MainMaterial />
         </mesh>
      </group>

      {/* --- TORSO --- */}
      <group position={[0, 0.35, 0]}>
         <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.25, 0.6, 8]} />
            <SkinMaterial />
         </mesh>
         {/* Tactical Vest */}
         <mesh position={[0, 0.1, 0]}>
             <cylinderGeometry args={[0.2, 0.22, 0.35, 8]} />
             <ArmorMaterial />
         </mesh>
         {/* Straps/Pouches */}
         <mesh position={[0, -0.15, 0.18]}>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <ArmorMaterial color="#333" />
         </mesh>
         <mesh position={[0, -0.15, -0.18]}>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <ArmorMaterial color="#333" />
         </mesh>
      </group>

      {/* --- LIMBS --- */}
      <group position={[0, 0.1, 0]}>
        {/* Shoulders */}
        <mesh position={[-0.32, 0.5, 0]} rotation={[0, 0, 0.1]}>
           <sphereGeometry args={[0.12]} />
           <MainMaterial />
        </mesh>
         <mesh position={[0.32, 0.5, 0]} rotation={[0, 0, -0.1]}>
           <sphereGeometry args={[0.12]} />
           <MainMaterial />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.35, 0.2, 0]} rotation={[0, 0, 0.2]} castShadow>
           <cylinderGeometry args={[0.07, 0.06, 0.45]} />
           <SkinMaterial />
        </mesh>
        {/* Forearm Armor */}
        <mesh position={[-0.45, -0.05, 0.1]} rotation={[0.3, 0.2, 0]} castShadow>
           <boxGeometry args={[0.12, 0.3, 0.12]} />
           <MainMaterial />
        </mesh>

        <mesh position={[0.35, 0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
           <cylinderGeometry args={[0.07, 0.06, 0.45]} />
           <SkinMaterial />
        </mesh>
        <mesh position={[0.45, -0.05, 0.1]} rotation={[0.3, -0.2, 0]} castShadow>
           <boxGeometry args={[0.12, 0.3, 0.12]} />
           <MainMaterial />
        </mesh>

        {/* Legs - Deep Crouch */}
        <group position={[0, -0.4, 0]}>
             {/* Left Leg */}
             <group position={[-0.2, 0, 0.2]} rotation={[-0.5, 0, -0.1]}>
                <mesh position={[0, 0.2, 0]}>
                   <cylinderGeometry args={[0.12, 0.1, 0.5]} />
                   <SkinMaterial />
                </mesh>
                <mesh position={[0, 0.2, 0.12]}>
                   <boxGeometry args={[0.15, 0.3, 0.05]} />
                   <ArmorMaterial />
                </mesh>
                <mesh position={[0, -0.1, 0.1]} rotation={[0.8, 0, 0]}>
                   <cylinderGeometry args={[0.09, 0.07, 0.6]} />
                   <ArmorMaterial />
                </mesh>
             </group>
             {/* Right Leg */}
             <group position={[0.2, 0, -0.2]} rotation={[0.5, 0, 0.1]}>
                <mesh position={[0, 0.2, 0]}>
                   <cylinderGeometry args={[0.12, 0.1, 0.5]} />
                   <SkinMaterial />
                </mesh>
                <mesh position={[0, 0.2, 0.12]}>
                   <boxGeometry args={[0.15, 0.3, 0.05]} />
                   <ArmorMaterial />
                </mesh>
                <mesh position={[0, -0.1, 0.1]} rotation={[0.2, 0, 0]}>
                   <cylinderGeometry args={[0.09, 0.07, 0.6]} />
                   <ArmorMaterial />
                </mesh>
             </group>
        </group>
      </group>

      {/* --- WEAPONS: TWIN ENERGY DAGGERS --- */}
      <group>
         {/* Dagger Left */}
         <group position={[-0.6, 0.4, 0.5]} rotation={[1.8, 0.2, 0]}>
             <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                <SkinMaterial />
             </mesh>
             <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.08, 0.04, 0.04]} />
                <ArmorMaterial />
             </mesh>
            <mesh position={[0, 0.3, 0]}>
               <coneGeometry args={[0.04, 0.6, 4]} />
               <MainMaterial />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
               <coneGeometry args={[0.02, 0.62, 4]} />
               <GlowMaterial intensity={1.5} />
            </mesh>
            <Trail width={0.4} length={4} color={data.color} attenuation={(t) => t * t}>
                <mesh position={[0, 0.6, 0]}>
                   <sphereGeometry args={[0.01]} />
                   <meshBasicMaterial color={data.color} />
                </mesh>
            </Trail>
         </group>

         {/* Dagger Right */}
         <group position={[0.6, 0.4, 0.5]} rotation={[1.8, -0.2, 0]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                <SkinMaterial />
             </mesh>
             <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.08, 0.04, 0.04]} />
                <ArmorMaterial />
             </mesh>
            <mesh position={[0, 0.3, 0]}>
               <coneGeometry args={[0.04, 0.6, 4]} />
               <MainMaterial />
            </mesh>
             <mesh position={[0, 0.3, 0]}>
               <coneGeometry args={[0.02, 0.62, 4]} />
               <GlowMaterial intensity={1.5} />
            </mesh>
             <Trail width={0.4} length={4} color={data.color} attenuation={(t) => t * t}>
                <mesh position={[0, 0.6, 0]}>
                   <sphereGeometry args={[0.01]} />
                   <meshBasicMaterial color={data.color} />
                </mesh>
            </Trail>
         </group>
      </group>
    </group>
  );

  const getModel = () => {
    switch(data.id) {
      case 'WARRIOR': return renderWarrior();
      case 'MAGE': return renderMage();
      case 'ROGUE': return renderRogue();
      default: return <boxGeometry />;
    }
  };

  return (
    <group 
      position={data.position} 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getModel()}
      
      {/* Floating Holographic Label */}
      <Text
        position={[0, 2.5, 0]}
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
      
      {/* Digital Selection Ring */}
      {isSelected && (
        <group position={[0, -0.95, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.9, 32]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <ringGeometry args={[1.0, 1.02, 32]} />
             <meshBasicMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Vertical light beam */}
          <mesh position={[0, 1, 0]}>
             <cylinderGeometry args={[0.8, 0.8, 2, 32, 1, true]} />
             <meshBasicMaterial color={data.color} transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default CharacterModel;
import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls, PerspectiveCamera, Sparkles, Grid } from '@react-three/drei';
import { CharacterClass, CharacterData, GeneratedLore } from './types';
import CharacterModel from './components/CharacterModel';
import Interface from './components/Interface';
import { generateCharacterLore, generateCharacterSpeech } from './services/geminiService';
import { audioService } from './services/audioService';

// Character Definitions - Cyberpunk Palette
const CHARACTERS: CharacterData[] = [
  {
    id: CharacterClass.WARRIOR,
    name: 'IRONCLAD',
    role: 'STREET SAMURAI',
    color: '#ff00aa', // Neon Pink
    position: [-2.5, 0, 0],
    stats: { strength: 95, intelligence: 40, speed: 50, defense: 90 }
  },
  {
    id: CharacterClass.MAGE,
    name: 'AETHER',
    role: 'NETRUNNER',
    color: '#00f3ff', // Neon Cyan
    position: [0, 0.5, 0], // Slightly elevated
    stats: { strength: 30, intelligence: 100, speed: 60, defense: 40 }
  },
  {
    id: CharacterClass.ROGUE,
    name: 'SHADE',
    role: 'GHOST OPERATIVE',
    color: '#ffee00', // Neon Yellow
    position: [2.5, 0, 0],
    stats: { strength: 60, intelligence: 70, speed: 100, defense: 30 }
  }
];

interface AppProps {
  enableAuth: boolean;
}

const App: React.FC<AppProps> = ({ enableAuth }) => {
  const [selectedId, setSelectedId] = useState<CharacterClass | null>(null);
  const [lore, setLore] = useState<GeneratedLore | null>(null);
  const [loadingLore, setLoadingLore] = useState(false);

  const handleSelect = (id: CharacterClass) => {
    if (selectedId === id) return; // Already selected
    setSelectedId(id);
    setLore(null);
    setLoadingLore(true);
  };

  // Fetch AI content (Lore + Speech) when selection changes
  useEffect(() => {
    if (selectedId) {
      const fetchLoreAndSpeech = async () => {
        // 1. Get Text Lore
        const data = await generateCharacterLore(selectedId);
        setLore(data);
        setLoadingLore(false);

        // 2. Get Speech (TTS) for the Quote
        if (data && data.quote) {
            const audioData = await generateCharacterSpeech(data.quote, selectedId);
            if (audioData) {
                audioService.playPCMData(audioData);
            }
        }
      };
      fetchLoreAndSpeech();
    } else {
        setLore(null);
    }
  }, [selectedId]);

  const selectedChar = CHARACTERS.find(c => c.id === selectedId) || null;

  return (
    <div className="relative w-full h-full bg-[#050505]">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true, toneMappingExposure: 1.5 }}>
          {/* Environment & Mood */}
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 5, 20]} />
          
          <PerspectiveCamera makeDefault position={[0, 1.5, 7]} fov={55} />
          
          <Suspense fallback={null}>
            {/* Cyberpunk Lighting: High contrast, colored fill lights */}
            <ambientLight intensity={0.2} />
            
            {/* Key Light (Cyan) */}
            <spotLight 
                position={[10, 10, 5]} 
                angle={0.3} 
                penumbra={1} 
                intensity={4} 
                color="#00f3ff"
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            {/* Fill Light (Pink) */}
            <pointLight position={[-10, 2, -5]} intensity={2} color="#ff00aa" />
            
            {/* Back Light (Yellow) */}
            <pointLight position={[0, 5, -5]} intensity={1} color="#ffee00" />

            {/* Retro-future Grid Floor */}
            <Grid 
              position={[0, -1.05, 0]} 
              args={[20, 20]} 
              cellSize={0.5} 
              cellThickness={0.5} 
              cellColor="#1a1a1a" 
              sectionSize={2.5} 
              sectionThickness={1} 
              sectionColor="#00f3ff" 
              fadeDistance={15} 
              fadeStrength={1} 
            />

            {/* Digital Particles */}
            <Sparkles 
              count={100} 
              scale={12} 
              size={3} 
              speed={0.2} 
              opacity={0.8} 
              color="#00f3ff" 
              noise={0.5}
            />

            {/* Characters */}
            <group position={[0, -1, 0]}>
              {CHARACTERS.map((char) => (
                <CharacterModel 
                  key={char.id} 
                  data={char} 
                  isSelected={selectedId === char.id}
                  onSelect={handleSelect}
                />
              ))}
              
              {/* Dynamic shadow grounding */}
              <ContactShadows 
                resolution={1024} 
                scale={15} 
                blur={2.5} 
                opacity={0.8} 
                far={10} 
                color="#000000" 
              />
            </group>
            
            <OrbitControls 
                enablePan={false} 
                enableZoom={false} 
                minPolarAngle={Math.PI / 3} 
                maxPolarAngle={Math.PI / 2}
                autoRotate={!selectedId} 
                autoRotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Interface 
        selectedChar={selectedChar} 
        lore={lore} 
        loadingLore={loadingLore} 
        onConfirm={() => alert(`System Access Granted: ${selectedChar?.name}`)}
        enableAuth={enableAuth}
      />
    </div>
  );
};

export default App;
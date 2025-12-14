import React, { useState, useEffect } from 'react';
import { CharacterData, GeneratedLore } from '../types';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface InterfaceProps {
  selectedChar: CharacterData | null;
  lore: GeneratedLore | null;
  loadingLore: boolean;
  onConfirm: () => void;
  enableAuth: boolean;
}

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-4 mb-3 group">
    <span className="w-24 text-xs font-mono font-bold uppercase tracking-widest text-cyber-cyan opacity-80 group-hover:opacity-100 transition-opacity">
      {label}
    </span>
    <div className="flex-1 h-3 bg-cyber-dark border border-white/10 skew-x-[-12deg] relative">
      <div 
        className="h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ 
            width: `${value}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}` 
        }}
      />
      {/* Grid lines on bar */}
      <div className="absolute inset-0 flex">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-black/20 h-full"></div>
        ))}
      </div>
    </div>
    <span className="text-xs font-mono text-white/80 w-8 text-right font-bold">{value}</span>
  </div>
);

const Interface: React.FC<InterfaceProps> = ({ selectedChar, lore, loadingLore, onConfirm, enableAuth }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [progress, setProgress] = useState(0);

  // Reset state when character changes
  useEffect(() => {
    setStatus('idle');
    setProgress(0);
  }, [selectedChar]);

  const handleInitialize = () => {
    if (status !== 'idle') return;
    
    setStatus('loading');
    
    // Start progress animation
    // Small delay to ensure render phase catches the 0 -> 100 transition
    setTimeout(() => setProgress(100), 50);

    // Complete after 1.5s
    setTimeout(() => {
      setStatus('success');
      // Trigger actual confirm after a brief success message
      setTimeout(() => {
        onConfirm();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 overflow-hidden">
      
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-cyber-cyan rounded-tl-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-cyber-pink rounded-br-3xl"></div>
        <div className="absolute top-1/2 left-4 w-1 h-20 bg-cyber-cyan"></div>
        <div className="absolute top-1/2 right-4 w-1 h-20 bg-cyber-pink"></div>
      </div>

      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto z-10">
        <div className="bg-cyber-black/80 border-l-4 border-cyber-cyan p-6 skew-x-[-10deg]">
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white skew-x-[10deg] uppercase font-sans drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
            NEO<span className="text-cyber-cyan">SELECT</span>
          </h1>
          <p className="text-xs text-cyber-cyan font-mono tracking-[0.3em] mt-2 skew-x-[10deg] uppercase animate-pulse">
            System Online // v2.0.77
          </p>
        </div>

        {enableAuth && (
          <div className="bg-cyber-black/80 backdrop-blur-sm p-3 border border-cyber-cyan/30 clip-path-polygon">
             <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-wider">
                    [ ACCESS TERMINAL ]
                  </button>
                </SignInButton>
             </SignedOut>
             <SignedIn>
                <UserButton />
             </SignedIn>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-end pointer-events-none z-10">
        {selectedChar && (
          <div className="pointer-events-auto w-full max-w-md">
            
            {/* Holographic Panel */}
            <div className="bg-cyber-black/90 backdrop-blur-md border border-white/10 p-8 relative overflow-hidden group">
               {/* Neon Glow Borders */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-pink to-transparent"></div>
               
               {/* Scanline Effect */}
               <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/1155985012/vector/scanlines-pattern.jpg?s=612x612&w=0&k=20&c=6b4qXlG8yR-i_xZ7G_L-m_x-y-m_x-y-m_x-y-m_x')] opacity-5 pointer-events-none mix-blend-overlay"></div>

              {/* Class Title */}
              <div className="mb-8 flex items-end gap-4 border-b border-white/10 pb-4">
                <h2 
                  className="text-4xl font-black uppercase tracking-tighter"
                  style={{ color: selectedChar.color, textShadow: `0 0 10px ${selectedChar.color}` }}
                >
                  {selectedChar.role}
                </h2>
                <span className="font-mono text-xs text-gray-500 mb-2">ID: {selectedChar.id}</span>
              </div>

              {/* Stats */}
              <div className="space-y-1 mb-8">
                <StatBar label="STR_MOD" value={selectedChar.stats.strength} color={selectedChar.color} />
                <StatBar label="INT_CPU" value={selectedChar.stats.intelligence} color={selectedChar.color} />
                <StatBar label="SPD_BUS" value={selectedChar.stats.speed} color={selectedChar.color} />
                <StatBar label="DEF_WALL" value={selectedChar.stats.defense} color={selectedChar.color} />
              </div>

              {/* AI Lore Terminal */}
              <div className="bg-black border border-white/20 p-4 mb-8 font-mono text-sm relative">
                <div className="absolute -top-3 left-4 bg-black px-2 text-xs text-cyber-pink border border-cyber-pink/50">
                  AI_NARRATIVE_MODULE
                </div>
                
                {loadingLore ? (
                  <div className="text-cyber-cyan animate-pulse">
                    &gt; ESTABLISHING UPLINK...<br/>
                    &gt; DECRYPTING DATA STREAM...
                  </div>
                ) : lore ? (
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed border-l-2 border-cyber-cyan pl-3">
                      <span className="text-cyber-cyan mr-2">&gt;&gt;</span>
                      {lore.story}
                    </p>
                    <p className="text-xs text-cyber-yellow border-t border-white/10 pt-3">
                      [AUDIO_LOG]: "{lore.quote}"
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">&gt; AWAITING TARGET LOCK...</p>
                )}
              </div>

              {/* Animated Action Button */}
              <button 
                onClick={handleInitialize}
                disabled={status !== 'idle'}
                className="w-full py-4 font-black text-xl uppercase tracking-widest transition-all clip-path-polygon relative overflow-hidden group border-2"
                style={{ 
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  borderColor: status === 'success' ? '#22c55e' : selectedChar.color,
                  backgroundColor: status === 'idle' ? selectedChar.color : (status === 'success' ? '#22c55e' : 'transparent'),
                  color: status === 'idle' || status === 'success' ? '#000' : selectedChar.color,
                  cursor: status === 'loading' ? 'wait' : 'pointer'
                }}
              >
                {/* Idle Hover Effect (Black Overlay) */}
                {status === 'idle' && (
                  <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-0"></div>
                )}
                
                {/* Loading Progress Bar */}
                {status === 'loading' && (
                  <div 
                    className="absolute top-0 left-0 h-full opacity-30 transition-all ease-out"
                    style={{ 
                       width: `${progress}%`, 
                       backgroundColor: selectedChar.color,
                       transitionDuration: '1500ms'
                    }}
                  />
                )}

                <span className="relative z-10 flex items-center justify-center gap-3">
                  {status === 'idle' && (
                    <>
                      <span className="group-hover:text-white transition-colors duration-200 group-hover:hidden">INITIALIZE LINK</span>
                      <span className="hidden group-hover:flex group-hover:text-white transition-colors duration-200 items-center gap-2">
                        <span className="animate-pulse">&gt;</span> CONNECT_NEURAL_NET <span className="animate-pulse">&lt;</span>
                      </span>
                    </>
                  )}
                  {status === 'loading' && (
                    <>
                      <span className="animate-pulse">ESTABLISHING UPLINK</span>
                      <span className="font-mono text-sm opacity-80">...</span>
                    </>
                  )}
                  {status === 'success' && (
                    <span className="flex items-center gap-2">
                       ACCESS GRANTED
                    </span>
                  )}
                </span>
              </button>

            </div>

          </div>
        )}
      </main>

      {/* Footer Instructions */}
      <footer className="pointer-events-none text-center pb-4 z-10">
         {!selectedChar && (
            <p className="font-mono text-xs animate-pulse text-cyber-cyan tracking-[0.5em] bg-black/50 inline-block px-4 py-1 border border-cyber-cyan/30">
               &lt; SELECT TARGET AVATAR &gt;
            </p>
         )}
      </footer>
    </div>
  );
};

export default Interface;
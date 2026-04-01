import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Egg, PawPrint, Mountain, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { Level } from '../types';
import { cn } from '../lib/utils';
import { SKINS } from '../constants';

interface GameCanvasProps {
  level: Level;
  robotPos: { x: number; y: number };
  robotDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  status: 'IDLE' | 'SUCCESS' | 'FAILURE';
  selectedSkinId: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, robotPos, robotDir, status, selectedSkinId }) => {
  const { gridSize, goalPos, obstacles } = level;
  const selectedSkin = SKINS.find(s => s.id === selectedSkinId) || SKINS[0];

  const getRotation = (dir: string) => {
    switch (dir) {
      case 'UP': return -90;
      case 'DOWN': return 90;
      case 'LEFT': return 180;
      case 'RIGHT': return 0;
      default: return 0;
    }
  };

  return (
    <div className="relative glass-card p-4 overflow-hidden neo-shadow border-4 border-amber-200">
      {/* Jungle decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-5 left-5 w-16 h-16 bg-green-400 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-5 right-5 w-20 h-20 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div 
        className="grid gap-1 relative z-10" 
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: '100%',
          aspectRatio: '1/1'
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isGoal = x === goalPos.x && y === goalPos.y;
          const isObstacle = obstacles.some(o => o.x === x && o.y === y);

          return (
            <div 
              key={i} 
              className={cn(
                "relative flex items-center justify-center rounded-xl transition-colors duration-500",
                isObstacle ? "bg-stone-300/50 border border-stone-400" : "bg-amber-50/30 border border-amber-100/50"
              )}
            >
              {isGoal && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="relative z-0"
                >
                  <Egg className="w-10 h-10 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.4)]" />
                </motion.div>
              )}
              {isObstacle && (
                <div className="relative">
                  <Mountain className="w-8 h-8 text-stone-500" />
                </div>
              )}
              
              {/* Dino */}
              {robotPos.x === x && robotPos.y === y && (
                <motion.div
                  layoutId="robot"
                  className={cn("absolute z-10 p-2 rounded-full shadow-xl border-2 border-white", selectedSkin.color)}
                  animate={{ rotate: getRotation(robotDir) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="relative">
                    <PawPrint className="w-8 h-8 text-white relative z-10" />
                    <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {status === 'SUCCESS' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-500/30 backdrop-blur-md text-white p-8 text-center"
          >
            <div className="bg-white p-6 rounded-full mb-6 shadow-2xl">
              <Sparkles className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-5xl font-black uppercase mb-2 tracking-tighter text-amber-600 drop-shadow-lg">ROAR!</h2>
            <p className="text-xl font-bold text-amber-800">Dino found the egg!</p>
          </motion.div>
        )}
        {status === 'FAILURE' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-500/30 backdrop-blur-md text-white p-8 text-center"
          >
            <div className="bg-white p-6 rounded-full mb-6 shadow-2xl">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-5xl font-black uppercase mb-2 tracking-tighter text-red-600 drop-shadow-lg">OOPS!</h2>
            <p className="text-xl font-bold text-red-800">Try a different path!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameCanvas;

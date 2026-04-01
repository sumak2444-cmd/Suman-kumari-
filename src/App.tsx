import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  ShoppingBag, 
  Info, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Trophy,
  Coins,
  ArrowRight,
  MousePointer2,
  CheckCircle2,
  Lightbulb,
  LayoutGrid,
  Check,
  HelpCircle,
  Star,
  BookOpen,
  PawPrint,
  Egg
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GameCanvas from './components/GameCanvas';
import CodeEditor from './components/CodeEditor';
import { LEVELS, SKINS, CODING_INTRO } from './constants';
import { Command } from './types';

type View = 'HOME' | 'INTRO' | 'LEVEL_SELECT' | 'LESSON' | 'PLAYING' | 'SHOP';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('garden_coins');
    return saved ? parseInt(saved) : 0;
  });
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('garden_skins');
    return saved ? JSON.parse(saved) : ['classic'];
  });
  const [selectedSkinId, setSelectedSkinId] = useState(() => {
    return localStorage.getItem('garden_selected_skin') || 'classic';
  });
  
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [robotDir, setRobotDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [commands, setCommands] = useState<{ type: Command }[]>([]);
  const [typingInput, setTypingInput] = useState('');

  const currentLevel = LEVELS[currentLevelIndex];

  useEffect(() => {
    localStorage.setItem('garden_coins', coins.toString());
    localStorage.setItem('garden_skins', JSON.stringify(purchasedSkins));
    localStorage.setItem('garden_selected_skin', selectedSkinId);
  }, [coins, purchasedSkins, selectedSkinId]);

  const resetLevel = useCallback(() => {
    setRobotPos(currentLevel.startPos);
    setRobotDir(currentLevel.startDir);
    setGameStatus('IDLE');
    setIsExecuting(false);
    setCommands([]);
    setShowHint(false);
    setTypingInput('');
  }, [currentLevel]);

  useEffect(() => {
    if (currentView === 'PLAYING') {
      resetLevel();
    }
  }, [currentView, currentLevel, resetLevel]);

  const handleAddCommand = (type: Command) => {
    if (commands.length < currentLevel.maxCommands) {
      setCommands(prev => [...prev, { type }]);
    }
  };

  const handleRemoveCommand = (index: number) => {
    setCommands(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setCommands([]);
    setRobotPos(currentLevel.startPos);
    setRobotDir(currentLevel.startDir);
    setGameStatus('IDLE');
    setTypingInput('');
  };

  const handleRunCode = async () => {
    if (isExecuting) return;
    
    let activeCommands = commands;

    // Handle typing level input conversion
    if (currentLevel.isTypingLevel) {
      const lines = typingInput.toLowerCase().split('\n').filter(l => l.trim() !== '');
      const converted: { type: Command }[] = [];
      for (const line of lines) {
        if (line.includes('move')) converted.push({ type: 'MOVE_FORWARD' });
        else if (line.includes('left')) converted.push({ type: 'TURN_LEFT' });
        else if (line.includes('right')) converted.push({ type: 'TURN_RIGHT' });
      }
      if (converted.length === 0) return;
      activeCommands = converted;
    }

    if (activeCommands.length === 0) return;
    
    setIsExecuting(true);
    setGameStatus('IDLE');
    let currentPos = { ...currentLevel.startPos };
    let currentDir = currentLevel.startDir;
    
    setRobotPos(currentPos);
    setRobotDir(currentDir);

    for (const cmd of activeCommands) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (cmd.type === 'MOVE_FORWARD') {
        const nextPos = { ...currentPos };
        if (currentDir === 'UP') nextPos.y--;
        if (currentDir === 'DOWN') nextPos.y++;
        if (currentDir === 'LEFT') nextPos.x--;
        if (currentDir === 'RIGHT') nextPos.x++;
        
        if (
          nextPos.x < 0 || nextPos.x >= currentLevel.gridSize ||
          nextPos.y < 0 || nextPos.y >= currentLevel.gridSize ||
          currentLevel.obstacles.some(obs => obs.x === nextPos.x && obs.y === nextPos.y)
        ) {
          setGameStatus('FAILURE');
          setIsExecuting(false);
          return;
        }
        currentPos = nextPos;
        setRobotPos(currentPos);
      } else if (cmd.type === 'TURN_LEFT') {
        const dirs: ('UP' | 'LEFT' | 'DOWN' | 'RIGHT')[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
        const idx = dirs.indexOf(currentDir as any);
        currentDir = dirs[(idx + 1) % 4] as any;
        setRobotDir(currentDir);
      } else if (cmd.type === 'TURN_RIGHT') {
        const dirs: ('UP' | 'RIGHT' | 'DOWN' | 'LEFT')[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const idx = dirs.indexOf(currentDir as any);
        currentDir = dirs[(idx + 1) % 4] as any;
        setRobotDir(currentDir);
      }
    }

    if (currentPos.x === currentLevel.goalPos.x && currentPos.y === currentLevel.goalPos.y) {
      setGameStatus('SUCCESS');
      setCoins(prev => prev + currentLevel.rewardCoins);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#78350f']
      });
    } else {
      setGameStatus('FAILURE');
    }
    setIsExecuting(false);
  };

  const handleBuySkin = (skinId: string, price: number) => {
    if (coins >= price && !purchasedSkins.includes(skinId)) {
      setCoins(prev => prev - price);
      setPurchasedSkins(prev => [...prev, skinId]);
      setSelectedSkinId(skinId);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-200">
      <div className="garden-field" style={{ background: 'linear-gradient(to bottom, #fef3c7, #fde68a)' }} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 neo-shadow border-2 border-amber-200">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView('HOME')}
          >
            <div className="bg-amber-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-amber-800 uppercase">Dino Code Quest</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-2xl border border-amber-200">
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-amber-700">{coins}</span>
            </div>
            <button 
              onClick={() => setShowHowToPlay(true)}
              className="p-2 hover:bg-amber-100 rounded-xl transition-colors text-amber-600"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-12 px-6 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="mb-8 inline-block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-amber-600 p-8 rounded-[40px] shadow-2xl shadow-amber-200 relative"
                >
                  <PawPrint className="w-24 h-24 text-white" />
                  <div className="absolute -top-4 -right-4 bg-amber-500 p-4 rounded-full shadow-lg">
                    <Egg className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-amber-900 mb-6 tracking-tighter uppercase">
                Dino Quest
              </h1>
              <p className="text-xl text-amber-800 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Coding seekho Dino ke saath! Pehle samjho coding kya hai, phir Dino ko rasta dikhao.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => setCurrentView('INTRO')}
                  className="glass-button text-xl px-12 py-5 flex items-center gap-3 group bg-amber-600 text-white"
                >
                  <BookOpen className="w-6 h-6" />
                  Start Learning
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setCurrentView('SHOP')}
                  className="bg-white text-amber-600 border-2 border-amber-200 rounded-2xl px-12 py-5 font-bold text-xl hover:bg-amber-50 transition-all flex items-center gap-3"
                >
                  <ShoppingBag className="w-6 h-6" />
                  Dino Shop
                </button>
              </div>
            </motion.div>
          )}

          {currentView === 'INTRO' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-card p-10 border-4 border-amber-200">
                <h2 className="text-4xl font-black text-amber-900 mb-6">{CODING_INTRO.title}</h2>
                <p className="text-xl text-amber-800 mb-8 leading-relaxed font-medium">
                  {CODING_INTRO.content}
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-amber-100 p-6 rounded-3xl border-2 border-amber-200">
                    <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-600" />
                      Coding Kyun Seekhein?
                    </h3>
                    <ul className="space-y-3">
                      {CODING_INTRO.why.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-amber-800 font-bold">
                          <Check className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-100 p-6 rounded-3xl border-2 border-amber-200">
                    <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-amber-600" />
                      Coding Languages
                    </h3>
                    <div className="space-y-4">
                      {CODING_INTRO.languages.map((lang, i) => (
                        <div key={i}>
                          <span className="font-black text-amber-900 block">{lang.name}</span>
                          <span className="text-sm text-amber-700 font-medium">{lang.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentView('LEVEL_SELECT')}
                  className="w-full bg-amber-600 text-white py-5 rounded-3xl font-black text-2xl hover:bg-amber-700 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  Chalo Game Shuru Karein!
                  <Play className="w-6 h-6 fill-current" />
                </button>
              </div>
            </motion.div>
          )}

          {currentView === 'LEVEL_SELECT' && (
            <motion.div 
              key="levels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-amber-900 tracking-tight uppercase">Dino's Journey</h2>
                <button 
                  onClick={() => setCurrentView('HOME')}
                  className="text-amber-600 font-bold hover:text-amber-800 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {LEVELS.map((level, idx) => (
                  <motion.div
                    key={level.id}
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 cursor-pointer group relative overflow-hidden border-2 border-amber-100"
                    onClick={() => {
                      setCurrentLevelIndex(idx);
                      setCurrentView('LESSON');
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <PawPrint className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-black">
                          LEVEL {level.id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          level.difficulty === 'Easy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {level.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-amber-900 mb-2">{level.title}</h3>
                      <p className="text-sm font-medium text-amber-700 mb-6 leading-snug">{level.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600 font-bold">
                          <Coins className="w-4 h-4" />
                          {level.rewardCoins}
                        </div>
                        <div className="bg-amber-600 text-white p-3 rounded-2xl group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'LESSON' && (
            <motion.div 
              key="lesson"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-card p-10 border-4 border-amber-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-600 p-3 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-amber-900">Lesson {currentLevel.id}: {currentLevel.lessonTitle}</h2>
                </div>
                
                <p className="text-xl text-amber-800 mb-8 leading-relaxed font-medium">
                  {currentLevel.lessonContent}
                </p>
                
                <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-200 mb-10">
                  <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    Important Notes:
                  </h3>
                  <ul className="space-y-4">
                    {currentLevel.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-3 text-amber-800 font-bold">
                        <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-amber-800 text-xs">
                          {i + 1}
                        </div>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentView('LEVEL_SELECT')}
                    className="flex-1 bg-white text-amber-600 border-2 border-amber-200 py-4 rounded-2xl font-black text-xl hover:bg-amber-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setCurrentView('PLAYING')}
                    className="flex-[2] bg-amber-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-amber-700 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    Chalo Code Karein!
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'PLAYING' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentView('LEVEL_SELECT')}
                    className="p-3 bg-white border border-amber-200 rounded-2xl hover:bg-amber-50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-amber-600" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black text-amber-900 leading-none mb-1">{currentLevel.title}</h2>
                    <p className="text-amber-600 font-bold">Level {currentLevel.id} • {currentLevel.difficulty}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2 bg-amber-400 text-amber-900 px-6 py-3 rounded-2xl font-black hover:bg-amber-500 transition-all shadow-lg shadow-amber-100"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Hint
                  </button>
                  <button 
                    onClick={resetLevel}
                    className="p-3 bg-white border border-amber-200 rounded-2xl hover:bg-amber-50 transition-colors"
                  >
                    <RotateCcw className="w-6 h-6 text-amber-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <GameCanvas 
                    level={currentLevel}
                    robotPos={robotPos}
                    robotDir={robotDir}
                    status={gameStatus}
                    selectedSkinId={selectedSkinId}
                  />
                  
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl relative"
                      >
                        <button 
                          onClick={() => setShowHint(false)}
                          className="absolute top-4 right-4 text-amber-600 hover:text-amber-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-start gap-4">
                          <div className="bg-amber-400 p-2 rounded-xl">
                            <Lightbulb className="w-6 h-6 text-amber-900" />
                          </div>
                          <div>
                            <h4 className="font-black text-amber-900 mb-1">HINT</h4>
                            <p className="text-amber-800 font-medium">{currentLevel.hint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="lg:col-span-5">
                  {currentLevel.isTypingLevel ? (
                    <div className="glass-card p-6 border-2 border-amber-200 neo-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-amber-900 uppercase">Type Your Code</h3>
                        <div className="bg-amber-100 px-3 py-1 rounded-lg text-xs font-black text-amber-700">TEXT MODE</div>
                      </div>
                      
                      <div className="bg-stone-900 rounded-2xl p-4 mb-6 font-mono text-amber-400 min-h-[200px] relative">
                        <textarea
                          value={typingInput}
                          onChange={(e) => setTypingInput(e.target.value)}
                          placeholder="// Type your commands here...
move
right
move"
                          className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-lg"
                          spellCheck={false}
                          disabled={isExecuting}
                        />
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                        <p className="text-xs font-bold text-amber-700 mb-2 uppercase">Available Commands:</p>
                        <div className="flex gap-2">
                          <code className="bg-white px-2 py-1 rounded border border-amber-200 text-amber-900 font-bold">move</code>
                          <code className="bg-white px-2 py-1 rounded border border-amber-200 text-amber-900 font-bold">left</code>
                          <code className="bg-white px-2 py-1 rounded border border-amber-200 text-amber-900 font-bold">right</code>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={handleClear}
                          disabled={isExecuting || !typingInput}
                          className="bg-white border border-amber-200 p-4 rounded-2xl font-black text-amber-600 hover:bg-red-50 hover:text-red-600"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleRunCode}
                          disabled={isExecuting || !typingInput}
                          className="bg-amber-600 text-white p-4 rounded-2xl font-black hover:bg-amber-700 shadow-lg"
                        >
                          Run Code
                        </button>
                      </div>
                    </div>
                  ) : (
                    <CodeEditor 
                      onRun={handleRunCode}
                      onAddCommand={handleAddCommand}
                      onRemoveCommand={handleRemoveCommand}
                      onClear={handleClear}
                      commands={commands}
                      isExecuting={isExecuting}
                      allowedCommands={currentLevel.allowedCommands}
                      maxCommands={currentLevel.maxCommands}
                    />
                  )}
                </div>
              </div>
              
              {gameStatus === 'SUCCESS' && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      if (currentLevelIndex < LEVELS.length - 1) {
                        setCurrentLevelIndex(prev => prev + 1);
                        setCurrentView('LESSON');
                      } else {
                        setCurrentView('LEVEL_SELECT');
                      }
                    }}
                    className="bg-amber-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:bg-amber-700 transition-all flex items-center gap-3 shadow-xl"
                  >
                    Next Lesson
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'SHOP' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-amber-900 tracking-tight mb-2 uppercase">Dino Shop</h2>
                  <p className="text-amber-700 font-bold">Unlock new Dino friends!</p>
                </div>
                <button 
                  onClick={() => setCurrentView('HOME')}
                  className="text-amber-600 font-bold hover:text-amber-800 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {SKINS.map((skin) => {
                  const isPurchased = purchasedSkins.includes(skin.id);
                  const isSelected = selectedSkinId === skin.id;
                  
                  return (
                    <div 
                      key={skin.id}
                      className={`glass-card p-8 flex flex-col items-center text-center transition-all border-2 ${
                        isSelected ? 'border-amber-600 bg-amber-50' : 'border-amber-100'
                      }`}
                    >
                      <div className={`w-24 h-24 ${skin.color} rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white`}>
                        <PawPrint className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-amber-900 mb-2">{skin.name}</h3>
                      
                      <div className="mt-auto w-full">
                        {isPurchased ? (
                          <button
                            onClick={() => setSelectedSkinId(skin.id)}
                            className={`w-full py-3 rounded-2xl font-bold transition-all ${
                              isSelected 
                                ? 'bg-amber-100 text-amber-700 cursor-default' 
                                : 'bg-amber-600 text-white hover:bg-amber-700'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Use This'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuySkin(skin.id, skin.price)}
                            disabled={coins < skin.price}
                            className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                              coins >= skin.price 
                                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-5 h-5" />
                            {skin.price}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simplified Guide Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-amber-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative border-4 border-amber-200"
            >
              <button 
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-amber-600 p-3 rounded-2xl">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-amber-900 tracking-tight">How to Play</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-amber-100 p-4 rounded-2xl shrink-0">
                      <BookOpen className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-amber-900 mb-1">1. Read the Lesson</h3>
                      <p className="text-amber-700 font-medium">Har level se pehle lesson aur notes dhyan se padhein.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="bg-amber-100 p-4 rounded-2xl shrink-0">
                      <LayoutGrid className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-amber-900 mb-1">2. Build Your Code</h3>
                      <p className="text-amber-700 font-medium">Blocks use karein ya code type karein Dino ko instructions dene ke liye.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="bg-amber-100 p-4 rounded-2xl shrink-0">
                      <Egg className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-amber-900 mb-1">3. Find the Egg</h3>
                      <p className="text-amber-700 font-medium">Dino ko egg tak pahunchao aur coins jeeto!</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowHowToPlay(false)}
                  className="w-full mt-12 bg-amber-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-amber-700 transition-all shadow-xl"
                >
                  Got it! Let's Go
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-amber-100">
        <div className="flex items-center justify-center gap-2 text-amber-700 font-black mb-4">
          <PawPrint className="w-5 h-5" />
          <span className="uppercase">Dino Code Quest</span>
        </div>
        <p className="text-amber-500 font-bold text-sm uppercase tracking-widest">
          Learn Coding Step-by-Step • 2026
        </p>
      </footer>
    </div>
  );
};

export default App;

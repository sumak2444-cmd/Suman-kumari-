import React from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Trash2, ChevronUp, RotateCw, RotateCcw as RotateLeft, Info } from 'lucide-react';
import { Command } from '../types';
import { cn } from '../lib/utils';

interface CodeEditorProps {
  allowedCommands: Command[];
  commands: { type: Command; value?: number }[];
  onAddCommand: (type: Command) => void;
  onRemoveCommand: (index: number) => void;
  onClear: () => void;
  onRun: () => void;
  isExecuting: boolean;
  maxCommands: number;
}

const COMMAND_DESCRIPTIONS: Record<Command, string> = {
  MOVE_FORWARD: "Ladybug ko ek kadam aage badhata hai.",
  TURN_LEFT: "Ladybug ko baayein (left) ghumata hai.",
  TURN_RIGHT: "Ladybug ko daayein (right) ghumata hai.",
  REPEAT: "Commands ko baar-baar chalata hai."
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  allowedCommands,
  commands,
  onAddCommand,
  onRemoveCommand,
  onClear,
  onRun,
  isExecuting,
  maxCommands
}) => {
  return (
    <div className="flex flex-col h-full glass-card p-6 neo-shadow border-2 border-amber-100">
      <div className="flex items-center justify-between mb-6 border-b border-amber-100 pb-4">
        <h3 className="text-xl font-black text-amber-900">Your Program</h3>
        <span className="text-sm font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">
          {commands.length} / {maxCommands}
        </span>
      </div>

      {/* Command Palette */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {allowedCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => onAddCommand(cmd)}
            disabled={isExecuting || commands.length >= maxCommands}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 shadow-sm",
              "bg-white border-amber-100 hover:bg-amber-50 hover:border-amber-200",
              isExecuting || commands.length >= maxCommands ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            )}
            title={COMMAND_DESCRIPTIONS[cmd]}
          >
            <div className="bg-amber-100 p-2 rounded-xl mb-2 text-amber-600">
              {cmd === 'MOVE_FORWARD' && <ChevronUp className="w-5 h-5" />}
              {cmd === 'TURN_LEFT' && <RotateLeft className="w-5 h-5" />}
              {cmd === 'TURN_RIGHT' && <RotateCw className="w-5 h-5" />}
            </div>
            <span className="text-[10px] text-center leading-tight font-bold text-amber-600">
              {cmd.replace('_', ' ')}
            </span>
          </button>
        ))}
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-y-auto bg-amber-50/50 border border-amber-100 rounded-2xl p-4 min-h-[250px] mb-6 space-y-3 scrollbar-hide">
        {commands.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-400 font-medium italic text-center px-4">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <Play className="w-8 h-8 opacity-20" />
            </div>
            Click commands above to build your path!
          </div>
        ) : (
          commands.map((cmd, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx}
              className="flex flex-col bg-white border border-amber-100 p-3 rounded-xl hover:bg-amber-50 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-600 text-white text-[10px] font-black rounded-lg shadow-md">
                    {idx + 1}
                  </span>
                  <span className="font-black text-xs text-amber-700 tracking-wider">{cmd.type.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => onRemoveCommand(idx)}
                  disabled={isExecuting}
                  className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start gap-2 border-t border-amber-50 pt-2 mt-1">
                <Info className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-amber-500 leading-tight">
                  {COMMAND_DESCRIPTIONS[cmd.type]}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onClear}
          disabled={isExecuting || commands.length === 0}
          className="flex items-center justify-center gap-2 bg-white border border-amber-200 p-4 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-amber-500 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
        >
          <RotateCcw className="w-5 h-5" />
          Clear
        </button>
        <button
          onClick={onRun}
          disabled={isExecuting || commands.length === 0}
          className="flex items-center justify-center gap-2 bg-amber-600 text-white p-4 rounded-2xl font-black hover:bg-amber-700 shadow-lg shadow-amber-100 transition-all active:scale-95 disabled:opacity-30"
        >
          <Play className="w-5 h-5 fill-current" />
          Run
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;

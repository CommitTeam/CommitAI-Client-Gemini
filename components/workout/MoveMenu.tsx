
import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Activity, Footprints, Flame, Dumbbell, Map, Music, Wind, Target, Headphones } from 'lucide-react';
import Mascot from './ui/Mascot';
import { playVibeMessage } from '../services/audioService';

interface WorkoutConfig {
  type: string;
  target: string;
  duration: string;
}

interface Props {
  userLevel: number;
  userName: string;
  onClose: () => void;
  onGoLive: (config: WorkoutConfig) => void;
  onCommit: (config: WorkoutConfig) => void;
}

const WORKOUT_TYPES = [
  { id: 'pushups', label: 'Pushups', icon: <Dumbbell className="w-5 h-5" />, targets: ['5', '15', '30', '50'] },
  { id: 'squats', label: 'Squats', icon: <Activity className="w-5 h-5" />, targets: ['15', '30', '50', '100'] },
  { id: 'jacks', label: 'Jumping Jacks', icon: <Zap className="w-5 h-5" />, targets: ['50', '100', '200', '300'] },
  { id: 'steps', label: 'Steps', icon: <Footprints className="w-5 h-5" />, targets: ['2000', '3000', '10000', '15000'] },
  { id: 'walk', label: 'Distance Walk', icon: <Map className="w-5 h-5" />, targets: ['2km', '5km', '10km', '15km'] },
  { id: 'calories', label: 'Calories', icon: <Flame className="w-5 h-5" />, targets: ['300', '500', '1000', '1500'] },
];

const MOODS = [
    { id: 'hype', label: 'Hype', icon: <Flame size={14} />, color: 'bg-orange-500', msg: "Let's bring the 🔥!" },
    { id: 'calm', label: 'Calm', icon: <Wind size={14} />, color: 'bg-blue-400', msg: "Zen mode activated 🧘" },
    { id: 'intense', label: 'Intense', icon: <Zap size={14} />, color: 'bg-red-600', msg: "Full send only 🚀" },
    { id: 'focused', label: 'Focused', icon: <Target size={14} />, color: 'bg-purple-500', msg: "Locked in 🎯" },
];

const SHORT_DURATION_TIMES = ['1 min', '2 min', '3 min'];
const LONG_DURATION_TIMES = ['1 hour', '12 hour', '24 hours'];

const MoveMenu: React.FC<Props> = ({ userLevel, userName, onClose, onGoLive, onCommit }) => {
  const [selectedType, setSelectedType] = useState(WORKOUT_TYPES[0]);
  const [selectedTarget, setSelectedTarget] = useState(WORKOUT_TYPES[0].targets[1]);
  const [selectedTime, setSelectedTime] = useState(SHORT_DURATION_TIMES[0]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0].id);

  // Trigger Mascot Reaction Helper
  const triggerMascot = (mood: 'excited' | 'cool' | 'idle', message: string) => {
      const event = new CustomEvent('mascot-trigger', { detail: { mood, message } });
      window.dispatchEvent(event);
  };

  const getTimeOptions = (typeId: string) => ['pushups', 'squats', 'jacks'].includes(typeId) ? SHORT_DURATION_TIMES : LONG_DURATION_TIMES;

  const handleTypeSelect = (type: typeof WORKOUT_TYPES[0]) => {
    setSelectedType(type);
    setSelectedTarget(type.targets[1] || type.targets[0]);
    setSelectedTime(getTimeOptions(type.id)[0]);
    triggerMascot('excited', `Ooh, ${type.label}! Fun choice.`);
  };

  const handleTargetSelect = (target: string) => {
      setSelectedTarget(target);
      triggerMascot('cool', `${target}? Easy work.`);
  };

  const handleMoodSelect = (mood: typeof MOODS[0]) => {
      setSelectedMood(mood.id);
      triggerMascot('cool', mood.msg);
  };

  const getConfig = (): WorkoutConfig => ({ type: selectedType.label, target: selectedTarget, duration: selectedTime });
  const isTrackingWorkout = ['steps', 'walk', 'calories'].includes(selectedType.id);
  const currentTimeOptions = getTimeOptions(selectedType.id);

  const handleAction = (action: 'live' | 'commit') => {
      // Trigger Audio Prompt
      playVibeMessage(selectedMood, userName);
      
      const config = getConfig();
      if (action === 'live') onGoLive(config);
      else onCommit(config);
  };

  // Dynamic Background Renderer
  const renderBackground = () => {
      let icon = <Dumbbell size={300} strokeWidth={0.5} />;
      let animation = "animate-pulse-slow";
      
      switch(selectedType.id) {
          case 'steps': 
          case 'walk':
              icon = <Footprints size={300} strokeWidth={0.5} />;
              animation = "animate-bounce"; 
              break;
          case 'squats':
              icon = <Activity size={300} strokeWidth={0.5} />;
              animation = "animate-squish"; 
              break;
          case 'calories':
              icon = <Flame size={300} strokeWidth={0.5} />;
              animation = "animate-pulse";
              break;
          case 'jacks':
              icon = <Zap size={300} strokeWidth={0.5} />;
              animation = "animate-ping opacity-10";
              break;
      }

      return (
          <div className={`absolute top-20 right-[-50px] opacity-[0.1] pointer-events-none transition-all duration-700 ${animation} text-black transform rotate-12`}>
              {icon}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="glass-panel w-full max-w-md pointer-events-auto transform transition-transform animate-slide-up max-h-[90vh] overflow-y-auto flex flex-col pb-safe rounded-t-[40px] sm:rounded-[40px] bg-white/95 relative overflow-hidden">
        
        {/* Dynamic Background Layer */}
        {renderBackground()}

        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Move</h2>
            <button onClick={onClose} className="bg-gray-100 p-2 hover:bg-gray-200 transition-colors rounded-full text-gray-600">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-8 flex-1 relative z-10">
            
            {/* Workout Type */}
            <div>
                <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3 ml-1">Workout Type</h3>
                <div className="grid grid-cols-2 gap-3">
                    {WORKOUT_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => handleTypeSelect(type)}
                            className={`
                                flex items-center gap-3 p-4 rounded-2xl transition-all
                                ${selectedType.id === type.id 
                                    ? 'bg-black text-white shadow-lg shadow-black/20' 
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                }
                            `}
                        >
                            {type.icon}
                            <span className="font-semibold text-sm uppercase">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Target */}
            <div>
                <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3 ml-1">Target</h3>
                <div className="flex flex-wrap gap-2">
                    {selectedType.targets.map(target => (
                        <button
                            key={target}
                            onClick={() => handleTargetSelect(target)}
                            className={`
                                flex-1 min-w-[60px] py-3 px-2 rounded-xl font-medium transition-all
                                ${selectedTarget === target 
                                    ? 'bg-punch-blue text-white shadow-md shadow-blue-500/30' 
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                }
                            `}
                        >
                            {target}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Limit */}
            <div>
                <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3 ml-1">Time Limit</h3>
                <div className="relative bg-white h-14 flex items-center overflow-hidden rounded-2xl border border-gray-100">
                    <select 
                        value={selectedTime}
                        onChange={(e) => { setSelectedTime(e.target.value); triggerMascot('idle', "Tick tock..."); }}
                        className="w-full h-full px-4 font-medium text-base bg-transparent appearance-none focus:outline-none cursor-pointer z-10 text-gray-900"
                    >
                        {currentTimeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                    <Clock className="absolute right-4 w-5 h-5 pointer-events-none text-gray-400" />
                </div>
            </div>

            {/* Mood / Vibe Selector */}
            <div>
                <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-1">
                    Vibe Check <Headphones size={12} />
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {MOODS.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap
                                ${selectedMood === mood.id 
                                    ? 'bg-black text-white border-black shadow-lg' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            <span className={selectedMood === mood.id ? 'text-white' : 'text-gray-400'}>{mood.icon}</span>
                            <span className="text-xs font-bold uppercase">{mood.label}</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 relative z-20">
            {isTrackingWorkout ? (
                 <button 
                    onClick={() => handleAction('live')}
                    className="w-full bg-black text-white py-4 hover:bg-gray-900 transition-all flex items-center justify-center gap-2 rounded-full shadow-xl shadow-black/20"
                 >
                     <Activity className="w-5 h-5" />
                     <span className="font-bold text-lg">Start Counting</span>
                 </button>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={() => handleAction('live')}
                        className="bg-black text-white py-4 rounded-[20px] flex flex-col items-center justify-center gap-1 shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform"
                     >
                         <Zap className="w-6 h-6 text-acid-green fill-acid-green" />
                         <span className="font-bold text-base">Go Live</span>
                     </button>

                     <button 
                        onClick={() => handleAction('commit')}
                        className="bg-gray-100 text-gray-900 py-4 rounded-[20px] flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                     >
                         <Clock className="w-6 h-6" />
                         <span className="font-bold text-base">Commit</span>
                     </button>
                </div>
            )}
        </div>

        {/* Floating Mascot Assistant - Adjusted Position */}
        <div className="absolute bottom-32 right-2 z-30 pointer-events-none">
            <div className="pointer-events-auto transform scale-75 origin-bottom-right">
                <Mascot variant="fixed" className="!static !bottom-auto !right-auto" />
            </div>
        </div>

      </div>
    </div>
  );
};

export default MoveMenu;

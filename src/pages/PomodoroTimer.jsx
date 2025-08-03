import  { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PomodoroTimer = () => {
  const { addPomodoroSession, tasks, assignments } = useApp();
  const [timerType, setTimerType] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 min in seconds
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      audioRef.current = {
        play: () => {
          try {
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (error) {
            console.warn('Could not play notification sound');
          }
        }
      };
    } catch (error) {
      console.warn('Web Audio API not supported. Timer will work without sound.');
      audioRef.current = null;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    // Set time based on timer type
    if (timerType === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else {
      setTimeLeft(breakDuration * 60);
    }
    
    // Reset timer state when changing types
    setIsActive(false);
    setSessionStartTime(null);
  }, [timerType, focusDuration, breakDuration]);
  
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (!isMuted && audioRef.current) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.warn('Could not play notification sound');
        }
      }
      
      // Record session if it was focus time
      if (timerType === 'focus' && sessionStartTime) {
        const endTime = new Date().toISOString();
        const sessionDuration = focusDuration * 60; // Duration in seconds
        
        addPomodoroSession({
          startTime: sessionStartTime,
          endTime,
          focusTime: sessionDuration,
          breakTime: 0,
          date: new Date().toISOString().split('T')[0],
          taskId: selectedTaskId || undefined
        });
        
        setSessionsCompleted(prev => prev + 1);
      }
      
      // Toggle timer type
      setTimerType(timerType === 'focus' ? 'break' : 'focus');
      setIsActive(false);
      setSessionStartTime(null);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, timerType, isMuted, focusDuration, sessionStartTime, selectedTaskId]);
  
  const toggleTimer = () => {
    if (!isActive) {
      // Starting a new session
      setSessionStartTime(new Date().toISOString());
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setSessionStartTime(null);
    if (timerType === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else {
      setTimeLeft(breakDuration * 60);
    }
  };
  
  const toggleFullscreen = () => {
    if (!timerRef.current) return;
    
    if (!isFullscreen) {
      if (timerRef.current.requestFullscreen) {
        timerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Combine tasks and assignments for selection
  const allItems = [
    ...tasks.map(task => ({ id: task.id, title: task.title, type: 'task' })),
    ...assignments.map(assignment => ({ id: assignment.id, title: assignment.title, type: 'assignment' }))
  ];
  
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">Pomodoro Timer</h1>
      
      {/* Main timer */}
      <div 
        ref={timerRef}
        className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 ${
          isFullscreen ? 'fixed inset-0 flex flex-col items-center justify-center' : ''
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timerType === 'focus' 
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimerType('focus')}
            >
              Focus
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timerType === 'break' 
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimerType('break')}
            >
              Break
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-7xl font-bold mb-8 ${
            timerType === 'focus' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full ${
                isActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                  : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
              }`}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            >
              <RotateCcw size={24} />
            </button>
          </div>
          
          {/* Show timer type and session count */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {timerType === 'focus' ? 'Focus Session' : 'Break Time'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sessions completed today: {sessionsCompleted}
            </div>
          </div>
        </div>
      </div>
      
      {/* Timer settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <h3 className="text-base font-medium mb-4">Timer Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Focus Duration (minutes)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                  className="flex-1 mr-4 accent-primary-600"
                />
                <span className="w-12 text-center">{focusDuration}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="flex-1 mr-4 accent-primary-600"
                />
                <span className="w-12 text-center">{breakDuration}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <h3 className="text-base font-medium mb-4">Link to Task</h3>
          
          <select
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="">-- Select a task or assignment --</option>
            <optgroup label="Tasks">
              {allItems.filter(item => item.type === 'task').map(item => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </optgroup>
            <optgroup label="Assignments">
              {allItems.filter(item => item.type === 'assignment').map(item => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </optgroup>
          </select>
          
          <div className="mt-4 flex items-center">
            <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Linking a task helps track where you spend your focus time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
 
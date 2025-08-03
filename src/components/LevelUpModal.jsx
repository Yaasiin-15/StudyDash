import  { useEffect } from 'react';
import { Trophy, Award, X } from 'lucide-react';



const LevelUpModal = ({ level, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md w-full animate-slideUp bg-gradient-to-br from-primary-600 to-secondary-600 p-6 rounded-2xl shadow-xl text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Trophy size={64} className="text-yellow-300" />
            <Award size={36} className="absolute -bottom-2 -right-2 text-yellow-300" />
          </div>
        </div>
        
        <h2 className="text-center text-2xl font-bold mb-2">Level Up</h2>
        <p className="text-center text-xl mb-4">
          You've reached <span className="font-bold">Level {level}</span>
        </p>
        
        <p className="text-center text-white/80 mb-6">
          Keep up the great work and continue building your study habits
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-primary-600 font-medium rounded-full hover:bg-white/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
 
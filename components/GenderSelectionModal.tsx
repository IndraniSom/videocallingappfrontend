import { FaMale, FaFemale } from 'react-icons/fa';

interface GenderSelectionModalProps {
  onSelect: (gender: 'male' | 'female') => void;
}

const GenderSelectionModal = ({ onSelect }: GenderSelectionModalProps) => {
  return (
    <div className="fixed inset-0 signup-background bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Gender</h2>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => onSelect('male')}
            className="flex flex-col items-center gap-3 p-6  transition-colors"
          >
            <FaMale className="text-5xl text-blue-500" />
            <span className="font-medium">Male</span>
          </button>
          <button
            onClick={() => onSelect('female')}
            className="flex flex-col items-center gap-3 p-6  transition-colors"
          >
            <FaFemale className="text-5xl text-pink-500" />
            <span className="font-medium">Female</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export { GenderSelectionModal };
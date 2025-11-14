import React from 'react';
import { Heart, Lock, Coffee, MessageCircle, Users, Video } from 'lucide-react';

const Abouts: React.FC = () => {
  const options = [
    {
      icon: <Heart className="w-5 h-5" />,
      text: 'Flirt with a cute girl',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      iconColor: 'text-pink-500'
    },
    {
      icon: <Lock className="w-5 h-5" />,
      text: 'Private conversations',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-500'
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      text: 'Spend relaxing evening',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      text: 'Talk to strangers',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-500'
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: 'Meet someone new',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      iconColor: 'text-rose-500'
    },
    {
      icon: <Video className="w-5 h-5" />,
      text: 'Audio and HD video calling',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            What do I want
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            today?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {options.slice(0, 3).map((option, index) => (
              <button
                key={index}
                className={`w-full ${option.bgColor} ${option.textColor} rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <div className={`${option.iconColor}`}>
                  {option.icon}
                </div>
                <span className="font-medium text-base sm:text-lg">{option.text}</span>
              </button>
            ))}
          </div>

          {/* Center Column - Profile Image */}
          <div className="flex items-center justify-center order-first md:order-none">
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80  overflow-hidden rounded-full">
                <img
                  src="https://res.cloudinary.com/dhjzu51mb/image/upload/v1760272023/h3ox9ndkb4rqdmllrvsi.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {options.slice(3, 6).map((option, index) => (
              <button
                key={index}
                className={`w-full ${option.bgColor} ${option.textColor} rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <div className={`${option.iconColor}`}>
                  {option.icon}
                </div>
                <span className="font-medium text-base sm:text-lg">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-4 sm:p-6 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-white">
              Ready to talk?
            </span>
          </div>
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 uppercase tracking-wide">
            START VIDEO CHAT NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default Abouts;
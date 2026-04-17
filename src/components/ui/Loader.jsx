import React from 'react';

const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  const content = (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="absolute w-8 h-8 bg-blue-600 rounded-full animate-pulse blur-sm opacity-50"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] z-10"></div>
        </div>
        {text && <p className="text-gray-500 text-sm font-medium dark:text-gray-400 tracking-wide">{text}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center dark:bg-slate-950/80">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

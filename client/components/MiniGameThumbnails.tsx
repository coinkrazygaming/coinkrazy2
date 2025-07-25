import React from "react";

// This component can be used to generate thumbnails that match the CoinKrazy.com style
// Similar to the uploaded images with blue gradient background and gold text

export const LuckyWheelThumbnail = () => (
  <div className="w-[400px] h-[400px] bg-gradient-to-b from-[#4B91F1] to-[#1D4ED8] flex flex-col items-center justify-center text-center relative">
    <h1
      className="text-6xl font-black text-[#FFD700] mb-4"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      LUCKY
    </h1>
    <h1
      className="text-6xl font-black text-[#FFD700] mb-8"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      WHEEL
    </h1>

    {/* Wheel */}
    <div className="relative">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] border-4 border-black relative">
        {/* Wheel sections */}
        <div className="absolute inset-2 rounded-full border-2 border-white">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 relative overflow-hidden">
            {/* Spokes */}
            <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-0"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-90"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-[135deg]"></div>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
        </div>
      </div>
    </div>

    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <h2 className="text-2xl font-bold text-[#1B4B84]">CoinKrazy.com</h2>
    </div>
  </div>
);

export const NumberGuessThumbnail = () => (
  <div className="w-[400px] h-[400px] bg-gradient-to-b from-[#4B91F1] to-[#1D4ED8] flex flex-col items-center justify-center text-center relative">
    <h1
      className="text-5xl font-black text-[#FFD700] mb-2"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      NUMBER
    </h1>
    <h1
      className="text-5xl font-black text-[#FFD700] mb-8"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      GUESS
    </h1>

    {/* Number Display */}
    <div className="bg-black rounded-lg p-6 mb-4 border-4 border-white">
      <div className="text-4xl font-mono text-green-400 font-bold">? ? ?</div>
    </div>

    {/* Number pad */}
    <div className="grid grid-cols-3 gap-2 mb-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <div
          key={num}
          className="w-8 h-8 bg-white rounded border-2 border-black flex items-center justify-center text-sm font-bold"
        >
          {num}
        </div>
      ))}
    </div>

    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <h2 className="text-2xl font-bold text-[#1B4B84]">CoinKrazy.com</h2>
    </div>
  </div>
);

export const CoinFlipThumbnail = () => (
  <div className="w-[400px] h-[400px] bg-gradient-to-b from-[#4B91F1] to-[#1D4ED8] flex flex-col items-center justify-center text-center relative">
    <h1
      className="text-6xl font-black text-[#FFD700] mb-4"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      COIN
    </h1>
    <h1
      className="text-6xl font-black text-[#FFD700] mb-8"
      style={{ textShadow: "4px 4px 0px #000", fontFamily: "Arial Black" }}
    >
      FLIP
    </h1>

    {/* Coins */}
    <div className="flex space-x-4 mb-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black flex items-center justify-center">
        <span className="text-2xl font-bold text-black">H</span>
      </div>
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black flex items-center justify-center">
        <span className="text-2xl font-bold text-black">T</span>
      </div>
    </div>

    {/* SC Values */}
    <div className="flex space-x-8 mb-4">
      <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
        <span className="text-sm font-bold text-black">0.1 SC</span>
      </div>
      <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
        <span className="text-sm font-bold text-black">0.2 SC</span>
      </div>
    </div>

    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <h2 className="text-2xl font-bold text-[#1B4B84]">CoinKrazy.com</h2>
    </div>
  </div>
);

// Instructions for creating actual image files:
// 1. These components can be rendered in a browser
// 2. Use browser dev tools to take screenshots
// 3. Save as WebP format in public/images/mini-games/
// 4. Or use tools like Puppeteer to automatically generate images

import React from "react";

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

const ZigzagLines: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="110"
    height="54"
    viewBox="0 0 110 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {[0, 12, 24, 36].map((offsetY) => (
      <path
        key={offsetY}
        d={`M2 ${14 + offsetY} L20 ${2 + offsetY} L38 ${14 + offsetY} L56 ${2 + offsetY} L74 ${14 + offsetY} L92 ${2 + offsetY} L108 ${14 + offsetY}`}
        stroke="white"
        strokeOpacity="0.16"
        strokeWidth="4.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ))}
  </svg>
);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
}) => {
  return (
    <div className="h-full bg-white flex flex-col justify-between font-sans select-none overflow-hidden">
      {/* Top Blue Banner with Exact Figma Zigzags & Top-Right Ring */}
      <div className="w-full h-[62%] bg-[#4562E8] relative overflow-hidden">
        {/* Top-Right Partial Ring */}
        <div className="absolute -top-10 -right-8 w-28 h-28 rounded-full border-[12px] border-white/15 pointer-events-none" />

        {/* Middle-Left Zigzag Pattern */}
        <ZigzagLines className="absolute top-[22%] -left-2 pointer-events-none" />

        {/* Bottom-Right Zigzag Pattern */}
        <ZigzagLines className="absolute bottom-5 -right-2 pointer-events-none" />
      </div>

      {/* Bottom Content (Left-Aligned) & Sharp Rectangular Button */}
      <div className="flex-1 px-7 py-6 bg-white flex flex-col justify-between text-left">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight mb-2.5">
            Manage What To Do
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
            The best way to manage what you have to do, don't forget your plans
          </p>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full py-3.5 bg-[#4562E8] hover:bg-[#3751CF] active:scale-[0.99] text-white font-medium rounded-none transition-colors cursor-pointer text-sm"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

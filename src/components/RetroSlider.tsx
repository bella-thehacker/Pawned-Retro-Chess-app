interface RetroSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function RetroSlider({
  value,
  min = 0,
  max = 100,
  onChange,
  disabled = false,
}: RetroSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full max-w-[200px]">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          w-full h-[6px] rounded-full appearance-none cursor-pointer
          bg-[#8B6B4A] outline-none
          disabled:opacity-40 disabled:cursor-not-allowed
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[18px]
          [&::-webkit-slider-thumb]:h-[18px]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#E7DFC9]
          [&::-webkit-slider-thumb]:border-[3px]
          [&::-webkit-slider-thumb]:border-[#C8A04A]
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:hover:shadow-glow
          [&::-moz-range-thumb]:w-[18px]
          [&::-moz-range-thumb]:h-[18px]
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[#E7DFC9]
          [&::-moz-range-thumb]:border-[3px]
          [&::-moz-range-thumb]:border-[#C8A04A]
          [&::-moz-range-thumb]:shadow-sm
          [&::-moz-range-thumb]:cursor-pointer
        `}
        style={{
          background: `linear-gradient(90deg, #C8A04A ${percentage}%, #8B6B4A ${percentage}%)`,
        }}
      />
      <span className="absolute right-0 -top-5 font-mono text-[11px] text-[#6B5B4A]">
        {value}
      </span>
    </div>
  );
}

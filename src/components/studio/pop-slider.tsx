"use client";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
  dataEl?: string;
  format?: (v: number) => string;
}

// Pop color-block slider matching the checker atlas design.
export function PopSlider({ label, value, min, max, step = 1, suffix = "", onChange, dataEl, format }: Props) {
  return (
    <label className="block select-none" data-el={dataEl}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#69170D]">{label}</span>
        <span className="rounded-[3px] bg-[#69170D] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#F7DE07]">
          {format ? format(value) : `${value}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pop-range mt-1.5 w-full"
      />
    </label>
  );
}

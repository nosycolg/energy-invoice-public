"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { formatMonthDisplay } from "./MonthPicker";

const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
];

interface MonthRangePickerProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function MonthRangePicker({ start, end, onChange, onClear, placeholder = "Selecionar período" }: MonthRangePickerProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();

  const [viewYear, setViewYear] = useState(() =>
    start ? parseInt(start.split("-")[0], 10) : now.getFullYear()
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
    if (onClear) {
      onClear();
    }
  };
  
  const startVal = start ? parseInt(start.split("-")[0], 10) * 12 + parseInt(start.split("-")[1], 10) - 1 : null;
  const endVal   = end   ? parseInt(end.split("-")[0], 10) * 12 + parseInt(end.split("-")[1], 10) - 1 : null;

  const selectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const selectedDate = `${viewYear}-${mm}`;
    const selectedVal = viewYear * 12 + monthIndex;

    if (!start || (start && end) || (!start && end)) {
        onChange(selectedDate, "");
    } else {
        if (startVal !== null && selectedVal < startVal) {
            onChange(selectedDate, "");
        } else {
            onChange(start, selectedDate);
            setOpen(false);
        }
    }
  };

  const displayValue = start && end 
    ? `${formatMonthDisplay(start)} - ${formatMonthDisplay(end)}`
    : start
      ? `${formatMonthDisplay(start)} - Seç. final`
      : "";

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-72">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-12 md:h-14 w-full rounded-2xl border border-transparent px-4 text-left text-sm md:text-base font-medium transition-all bg-slate-50 hover:bg-slate-100 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white
          ${open
            ? "bg-white ring-2 ring-emerald-500/20 border-emerald-500 hover:bg-white"
            : ""
          }`}
      >
        <Calendar className={`h-5 w-5 shrink-0 transition-colors ${(start || end) ? "text-emerald-600" : "text-slate-400"}`} />

        {displayValue ? (
          <span className="flex-1 text-slate-800 font-bold">{displayValue}</span>
        ) : (
          <span className="flex-1 text-slate-500">{placeholder}</span>
        )}

        {(start || end) && (
          <span
            role="button"
            onClick={clear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-72 origin-top-left rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS_SHORT.map((short, i) => {
              const currentVal = viewYear * 12 + i;
              const isStart = startVal === currentVal;
              const isEnd = endVal === currentVal;
              const isInRange = startVal !== null && endVal !== null && currentVal > startVal && currentVal < endVal;
              const isDisabled = startVal !== null && !endVal && currentVal < startVal;

              return (
                <button
                  key={short}
                  type="button"
                  onClick={() => selectMonth(i)}
                  disabled={isDisabled}
                  className={`relative rounded-lg py-2 text-sm font-semibold transition-all
                    ${isDisabled
                      ? "text-slate-300 cursor-not-allowed bg-transparent"
                      : isStart || isEnd
                        ? "bg-emerald-600 text-white"
                        : isInRange
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr',
  'Mai', 'Jun', 'Jul', 'Ago',
  'Set', 'Out', 'Nov', 'Dez',
];

export function formatMonthDisplay(value: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  if (!year || !month) return '';
  const monthName = MONTHS_FULL[parseInt(month, 10) - 1];
  const currentYear = new Date().getFullYear().toString();
  return year === currentYear ? monthName : `${monthName} de ${year}`;
}

interface MonthPickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
}

export function MonthPicker({ value, onChange, placeholder = 'Selecionar mês', min, max }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();

  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.split('-')[0], 10) : now.getFullYear()
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setViewYear(parseInt(value.split('-')[0], 10));
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selYear  = value ? parseInt(value.split('-')[0], 10) : -1;
  const selMonth = value ? parseInt(value.split('-')[1], 10) - 1 : -1;

  const selectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, '0');
    onChange(`${viewYear}-${mm}`);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-14 w-full rounded-2xl border px-4 text-left text-base font-medium transition-all bg-white shadow-sm
          flex items-center gap-3 group
          ${open
            ? 'border-emerald-500 bg-white outline-none ring-4 ring-emerald-500/20'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
          }`}
      >
        <Calendar className={`h-5 w-5 shrink-0 transition-colors ${value ? 'text-emerald-500' : 'text-slate-400'}`} />

        {value ? (
          <span className="flex-1 text-slate-900">{formatMonthDisplay(value)}</span>
        ) : (
          <span className="flex-1 text-slate-400">{placeholder}</span>
        )}

        {value && (
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
        <div className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150">

          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-base font-bold text-slate-900">{viewYear}</span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((short, i) => {
              const isSelected = selYear === viewYear && selMonth === i;
              const isCurrentMonth =
                viewYear === now.getFullYear() && i === now.getMonth();

              const currentVal = viewYear * 12 + i;
              const minVal = min ? parseInt(min.split('-')[0], 10) * 12 + parseInt(min.split('-')[1], 10) - 1 : null;
              const maxVal = max ? parseInt(max.split('-')[0], 10) * 12 + parseInt(max.split('-')[1], 10) - 1 : null;
              
              const isDisabled = (minVal !== null && currentVal < minVal) || (maxVal !== null && currentVal > maxVal);

              return (
                <button
                  key={short}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectMonth(i)}
                  className={`relative rounded-xl py-3 text-sm font-semibold transition-all
                    ${isDisabled
                      ? 'text-slate-300 cursor-not-allowed bg-transparent'
                      : isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isCurrentMonth
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  {short}
                  {isCurrentMonth && !isSelected && !isDisabled && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

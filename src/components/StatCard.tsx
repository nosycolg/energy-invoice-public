import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'blue' | 'violet' | 'amber';
}

const accents = {
  emerald: {
    icon: 'text-emerald-500',
    ring: 'ring-emerald-100',
    bg: 'bg-emerald-50',
  },
  blue: {
    icon: 'text-blue-500',
    ring: 'ring-blue-100',
    bg: 'bg-blue-50',
  },
  violet: {
    icon: 'text-violet-500',
    ring: 'ring-violet-100',
    bg: 'bg-violet-50',
  },
  amber: {
    icon: 'text-amber-500',
    ring: 'ring-amber-100',
    bg: 'bg-amber-50',
  },
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'emerald',
}: StatCardProps) {
  const styles = accents[accent];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.ring} ${styles.bg}`}
      >
        <Icon className={`h-5 w-5 ${styles.icon}`} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-semibold leading-none text-slate-900 tabular-nums">
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

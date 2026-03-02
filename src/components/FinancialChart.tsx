'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { FinancialGrouped } from '@/lib/types';

const MONTHS = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
];

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface FinancialChartProps {
  data: FinancialGrouped[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="mb-2 font-medium text-slate-600">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{BRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function FinancialChart({ data }: FinancialChartProps) {
  const chartData = data.map((d) => ({
    label: `${MONTHS[d.month - 1]} ${String(d.year).slice(-2)}`,
    'Valor s/GD': d.valorTotalSemGd,
    'Economia GD': d.economiaGdReais,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
          }
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 12 }}
        />
        <Bar dataKey="Valor s/GD" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Economia GD" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

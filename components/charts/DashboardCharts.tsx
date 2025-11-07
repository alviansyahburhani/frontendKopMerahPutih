// Lokasi: components/charts/DashboardCharts.tsx
"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

// Helper untuk format mata uang di tooltip
const formatCurrency = (value: number) => {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
};

// --- Pie Chart Sederhana ---
interface PieData {
  name: string;
  value: number;
}
interface DashboardPieChartProps {
  data: PieData[];
  colors: string[];
}

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.07) return null; // Sembunyikan label jika terlalu kecil

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const DashboardPieChart = ({ data, colors }: DashboardPieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend iconType="circle" />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          fill="#8884d8"
          labelLine={false}
          label={CustomPieLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Bar Chart Sederhana (untuk 1 data, misal: Top Kategori) ---
interface BarData {
  name: string;
  value: number;
}
interface DashboardBarChartProps {
  data: BarData[];
  fillColor: string;
}

export const DashboardBarChart = ({ data, fillColor }: DashboardBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString("id-ID")}
          allowDecimals={false} // Pastikan tidak ada desimal
        />
        <Tooltip
          formatter={(value: number) => [
            value.toLocaleString("id-ID"),
            "Jumlah",
          ]}
        />
        <Bar dataKey="value" fill={fillColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Area Chart (Line Chart) untuk Pertumbuhan ---
interface GrowthData {
  name: string; // e.g., "Jan '25"
  value: number; // e.g., 5
}
interface DashboardGrowthChartProps {
  data: GrowthData[];
  strokeColor: string;
  fillColor: string;
  dataKey: string;
  unit: "Rp" | "anggota";
}

export const DashboardGrowthChart = ({
  data,
  strokeColor,
  fillColor,
  dataKey,
  unit
}: DashboardGrowthChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(value) => 
            unit === "Rp" 
              ? `Rp${(value / 1000000).toLocaleString()}Jt` 
              : value.toLocaleString()
          }
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          formatter={(value: number) => [
            unit === "Rp" ? formatCurrency(value) : `${value} ${unit}`,
            dataKey,
          ]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          fillOpacity={1}
          fill={`url(#color${dataKey})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// --- [INI YANG HILANG] Chart Arus Kas (Setoran vs Penarikan) ---
interface CashflowData {
  name: string; // "Jan '25"
  Setoran: number;
  Penarikan: number;
}
interface DashboardCashflowChartProps {
  data: CashflowData[];
  colorSetoran: string;
  colorPenarikan: string;
}

export const DashboardCashflowChart = ({ 
  data, 
  colorSetoran, 
  colorPenarikan 
}: DashboardCashflowChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `Rp${(value / 1000000).toLocaleString()}Jt`} 
        />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend iconType="circle" />
        <Bar dataKey="Setoran" fill={colorSetoran} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Penarikan" fill={colorPenarikan} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Wrench,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS_STATUS: Record<string, string> = {
  manutencao_simples: "#ca8a04",
  manutencao_critica: "#dc2626",
  liberado: "#15803d",
  avaria_cobranca: "#7f1d1d",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#1B0F8E]/20 border-t-[#1B0F8E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-gray-500 py-20">Erro ao carregar dados</p>;

  const metricCards = [
    {
      label: "Total de Checklists",
      value: data.totalChecklists,
      icon: ClipboardList,
      color: "text-[#1B0F8E]",
      bg: "bg-[#1B0F8E]/10",
    },
    {
      label: "Em Manutenção",
      value: data.emManutencao,
      icon: Wrench,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Taxa de Aprovação",
      value: `${data.taxaAprovacao}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avarias no Mês",
      value: data.avariasNoMes,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const pieData = data.statusDistribuicao.map((s) => ({
    name: STATUS_LABELS[s.status]?.label || s.status,
    value: s.total,
    color: COLORS_STATUS[s.status] || "#6b7280",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
        Dashboard
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equipamentos Mais Devolvidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Equipamentos Mais Devolvidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.equipamentosMaisDevolvidos}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1B0F8E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribuição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Status das Devoluções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: "11px" }}
                    layout="horizontal"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Devoluções ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.devolucoesTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => {
                      const d = new Date(v + "T12:00:00");
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(v) => {
                      const d = new Date(v + "T12:00:00");
                      return d.toLocaleDateString("pt-BR");
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1B0F8E"
                    strokeWidth={2}
                    dot={{ fill: "#1B0F8E" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Defeitos Mais Comuns */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Defeitos Mais Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.defeitosMaisComuns}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="defeito"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="total" fill="#dc2626" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Motoristas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Motoristas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.motoristas}>
                  <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#00E676" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Clientes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Ranking de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Cliente</th>
                    <th className="text-center py-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-2 font-medium text-gray-500">Avarias</th>
                    <th className="text-center py-2 font-medium text-gray-500">%Prob</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankingClientes.slice(0, 10).map((c) => (
                    <tr key={c.cliente} className="border-b last:border-0">
                      <td className="py-2 font-medium truncate max-w-[120px]">{c.cliente}</td>
                      <td className="py-2 text-center">{c.total}</td>
                      <td className="py-2 text-center">
                        <span className={c.avarias > 0 ? "text-red-600 font-bold" : ""}>
                          {c.avarias}
                        </span>
                      </td>
                      <td className="py-2 text-center">{c.taxaProblemas}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { STATUS_LABELS } from "@/lib/types";
import type { ChecklistRecord } from "@/lib/types";

export default function HistoricoPage() {
  const [search, setSearch] = useState("");
  const [checklists, setChecklists] = useState<ChecklistRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    equipment: "",
    client: "",
    patrimony: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "20",
      sortBy: "dataConferencia",
      sortOrder: "desc",
    });
    if (search) params.set("search", search);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.status) params.set("status", filters.status);
    if (filters.equipment) params.set("equipment", filters.equipment);
    if (filters.client) params.set("client", filters.client);
    if (filters.patrimony) params.set("patrimony", filters.patrimony);

    try {
      const res = await fetch(`/api/checklists?${params}`);
      const json = await res.json();
      setChecklists(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch {
      console.error("Erro ao buscar checklists");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", status: "", equipment: "", client: "", patrimony: "" });
    setSearch("");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ["Data", "Equipamento", "Patrimônio", "Cliente", "Motorista", "Status"];
    const rows = checklists.map((c) => [
      new Date(c.dataConferencia).toLocaleDateString("pt-BR"),
      c.equipamento,
      c.patrimonio,
      c.cliente,
      c.motorista || "",
      STATUS_LABELS[c.statusFinal]?.label || c.statusFinal,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklists_somaq_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          Histórico
        </h1>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">CSV</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por equipamento, cliente, patrimônio..."
          className="pl-10 pr-12 h-12 text-base touch-target"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg touch-target ${
            showFilters ? "bg-[#1B0F8E] text-white" : "text-gray-400"
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    <Calendar className="w-3 h-3 inline mr-1" />De
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    <Calendar className="w-3 h-3 inline mr-1" />Até
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Equipamento</label>
                  <Input
                    value={filters.equipment}
                    onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
                    placeholder="Filtrar..."
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Cliente</label>
                  <Input
                    value={filters.client}
                    onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                    placeholder="Filtrar..."
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Patrimônio</label>
                  <Input
                    value={filters.patrimony}
                    onChange={(e) => setFilters({ ...filters, patrimony: e.target.value })}
                    placeholder="Filtrar..."
                    className="h-10 text-sm"
                  />
                </div>
                <div className="col-span-2 lg:col-span-3">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
                    <X className="w-3 h-3" /> Limpar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-sm text-gray-400">
        {total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
      </p>

      {/* Table / Cards (mobile: cards, desktop: table) */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#1B0F8E]/20 border-t-[#1B0F8E] rounded-full animate-spin" />
        </div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum checklist encontrado</p>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="lg:hidden space-y-2">
            {checklists.map((c) => {
              const statusInfo = STATUS_LABELS[c.statusFinal];
              return (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChecklist(c)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{c.equipamento}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {c.cliente} &middot; #{c.patrimonio}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(c.dataConferencia).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {statusInfo && (
                          <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-[10px] px-2`}>
                            {statusInfo.label}
                          </Badge>
                        )}
                        <Eye className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Equipamento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Patrimônio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Motorista</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((c) => {
                  const statusInfo = STATUS_LABELS[c.statusFinal];
                  return (
                    <tr
                      key={c.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedChecklist(c)}
                    >
                      <td className="py-3 px-4">
                        {new Date(c.dataConferencia).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 font-medium">{c.equipamento}</td>
                      <td className="py-3 px-4">{c.patrimonio}</td>
                      <td className="py-3 px-4">{c.cliente}</td>
                      <td className="py-3 px-4 text-gray-500">{c.motorista || "—"}</td>
                      <td className="py-3 px-4">
                        {statusInfo && (
                          <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-xs`}>
                            {statusInfo.label}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="touch-target"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="touch-target"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedChecklist && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">
                  {selectedChecklist.equipamento}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Data</span>
                    <span className="font-medium">
                      {new Date(selectedChecklist.dataConferencia).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Patrimônio</span>
                    <span className="font-medium">{selectedChecklist.patrimonio}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Cliente</span>
                    <span className="font-medium">{selectedChecklist.cliente}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Responsável</span>
                    <span className="font-medium">{selectedChecklist.responsavel}</span>
                  </div>
                  {selectedChecklist.motorista && (
                    <div>
                      <span className="text-gray-500 block text-xs">Motorista</span>
                      <span className="font-medium">{selectedChecklist.motorista}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  {STATUS_LABELS[selectedChecklist.statusFinal] && (
                    <Badge
                      className={`${STATUS_LABELS[selectedChecklist.statusFinal].bg} ${STATUS_LABELS[selectedChecklist.statusFinal].color} border-0 px-3 py-1`}
                    >
                      {STATUS_LABELS[selectedChecklist.statusFinal].label}
                    </Badge>
                  )}
                </div>

                {/* Itens */}
                {selectedChecklist.itensVerificacao.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Itens de Verificação</h3>
                    <div className="space-y-1">
                      {selectedChecklist.itensVerificacao.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {item.conforme ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={item.conforme ? "text-gray-600" : "text-red-600 font-medium"}>
                            {item.nome}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist Geral */}
                {selectedChecklist.checklistGeral && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Checklist Geral</h3>
                    <div className="space-y-1">
                      {Object.entries({
                        "Equipamento limpo": selectedChecklist.checklistGeral.equipamentoLimpo,
                        "Sem quebras": selectedChecklist.checklistGeral.semQuebras,
                        "Sem peças faltantes": selectedChecklist.checklistGeral.semPecasFaltantes,
                        "Funcionando": selectedChecklist.checklistGeral.funcionandoCorretamente,
                        "Sem mau uso": selectedChecklist.checklistGeral.semSinaisMauUso,
                      }).map(([label, ok]) => (
                        <div key={label} className="flex items-center gap-2 text-sm">
                          {ok ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {selectedChecklist.observacoes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Observações</h3>
                    <p className="text-sm text-gray-600">{selectedChecklist.observacoes}</p>
                  </div>
                )}

                {/* PDF do Drive */}
                {selectedChecklist.pdfUrl && (
                  <div>
                    <a
                      href={selectedChecklist.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-[#1B0F8E]/5 rounded-lg border border-[#1B0F8E]/20 hover:bg-[#1B0F8E]/10 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-[#1B0F8E]" />
                      <span className="text-sm font-medium text-[#1B0F8E]">
                        Ver PDF no Google Drive
                      </span>
                    </a>
                  </div>
                )}

                {/* Fotos */}
                {selectedChecklist.fotos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      Fotos ({selectedChecklist.fotos.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedChecklist.fotos.map((foto, i) => {
                        const thumbnailUrl = foto.driveId
                          ? `https://drive.google.com/thumbnail?id=${foto.driveId}&sz=w400`
                          : foto.url;
                        const fullUrl = foto.fullUrl || foto.url;
                        return (
                          <a
                            key={i}
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-square rounded-lg bg-gray-100 overflow-hidden border hover:border-[#1B0F8E] transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnailUrl}
                              alt={foto.nome || `Foto ${i + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

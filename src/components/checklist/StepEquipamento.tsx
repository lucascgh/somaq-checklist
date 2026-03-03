"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { ChecklistFormData, CategoriaEquipamentos } from "@/lib/types";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

export default function StepEquipamento({ formData, onChange }: Props) {
  const [categorias, setCategorias] = useState<CategoriaEquipamentos[]>([]);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/equipamentos")
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCategorias = useMemo(() => {
    if (!search.trim()) return categorias;
    const term = search.toLowerCase();
    return categorias
      .map((cat) => ({
        ...cat,
        equipamentos: cat.equipamentos.filter((eq) =>
          eq.nome.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.equipamentos.length > 0);
  }, [categorias, search]);

  // Auto-expand all categories when searching
  useEffect(() => {
    if (search.trim()) {
      setExpandedCats(new Set(filteredCategorias.map((c) => c.categoria)));
    }
  }, [search, filteredCategorias]);

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const selectEquipamento = (nome: string, categoria: string) => {
    onChange({
      equipamento: nome,
      categoria,
      itensVerificacao: {},
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[#1B0F8E]/20 border-t-[#1B0F8E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Selecione o Equipamento
      </h2>

      {/* Search - PROMINENT */}
      <div className="relative sticky top-0 z-10 bg-white pb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipamento..."
          className="pl-10 h-12 text-base touch-target border-2 border-[#1B0F8E]/20 focus:border-[#1B0F8E]"
          autoFocus
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filteredCategorias.reduce((a, c) => a + c.equipamentos.length, 0)} encontrados
          </span>
        )}
      </div>

      {/* Equipment selected banner */}
      {formData.equipamento && (
        <div className="bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl p-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {formData.equipamento}
          </span>
        </div>
      )}

      {/* Categories with accordions */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto -mx-1 px-1">
        {filteredCategorias.map((cat) => (
          <div key={cat.categoria} className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(cat.categoria)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 touch-target transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedCats.has(cat.categoria) ? (
                  <ChevronDown className="w-4 h-4 text-[#1B0F8E]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-medium text-sm text-gray-800">
                  {cat.categoria}
                </span>
              </div>
              <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                {cat.equipamentos.length}
              </span>
            </button>

            <AnimatePresence>
              {expandedCats.has(cat.categoria) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-1">
                    {cat.equipamentos.map((eq) => {
                      const isSelected = formData.equipamento === eq.nome;
                      return (
                        <button
                          key={eq.nome}
                          onClick={() => selectEquipamento(eq.nome, cat.categoria)}
                          className={`w-full text-left p-3 rounded-lg touch-target transition-all ${
                            isSelected
                              ? "bg-[#1B0F8E] text-white shadow-md"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{eq.nome}</span>
                            {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredCategorias.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Nenhum equipamento encontrado</p>
            <p className="text-xs mt-1">Tente outro termo de busca</p>
          </div>
        )}
      </div>
    </div>
  );
}

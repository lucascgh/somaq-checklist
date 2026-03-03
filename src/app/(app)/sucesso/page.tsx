"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SucessoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, delay: 0.1 }}
      >
        <div className="w-24 h-24 bg-[#00E676]/20 rounded-full flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.3 }}
          >
            <CheckCircle className="w-14 h-14 text-[#00E676]" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Checklist Enviado!
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          O checklist foi salvo com sucesso. O PDF foi gerado e está disponível
          no histórico.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Link href="/checklist" className="w-full">
          <Button className="w-full h-12 text-base bg-[#1B0F8E] hover:bg-[#150B6E] touch-target gap-2">
            <Plus className="w-5 h-5" />
            Novo Checklist
          </Button>
        </Link>
        <Link href="/dashboard" className="w-full">
          <Button
            variant="outline"
            className="w-full h-12 text-base touch-target gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Ver Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

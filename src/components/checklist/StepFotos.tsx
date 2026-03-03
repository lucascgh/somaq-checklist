"use client";

import { useRef } from "react";
import { Camera, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChecklistFormData, FileWithPreview } from "@/lib/types";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

export default function StepFotos({ formData, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 1200;
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.fotos.length + files.length > 10) {
      alert("Máximo de 10 fotos");
      return;
    }

    const newPhotos: FileWithPreview[] = [];
    for (const file of files) {
      const compressed = await compressImage(file);
      newPhotos.push({
        file: compressed,
        preview: URL.createObjectURL(compressed),
        id: `${Date.now()}-${Math.random()}`,
      });
    }

    onChange({ fotos: [...formData.fotos, ...newPhotos] });
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    const photo = formData.fotos.find((f) => f.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    onChange({ fotos: formData.fotos.filter((f) => f.id !== id) });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Fotos do Equipamento
      </h2>
      <p className="text-sm text-gray-500">
        Tire fotos do equipamento para registro. Máximo 10 fotos.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCapture}
        className="hidden"
      />

      {/* Capture button - big and prominent for mobile */}
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={formData.fotos.length >= 10}
        className="w-full h-16 text-base bg-[#1B0F8E] hover:bg-[#150B6E] touch-target gap-3"
      >
        <Camera className="w-6 h-6" />
        Tirar Foto ({formData.fotos.length}/10)
      </Button>

      {/* Photo grid */}
      {formData.fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {formData.fotos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt="Foto do equipamento"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity touch-target"
                style={{ opacity: 1 }} // Always visible on mobile
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.fotos.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhuma foto adicionada</p>
        </div>
      )}
    </div>
  );
}

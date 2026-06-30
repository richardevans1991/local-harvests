"use client";

import SafeImage from "@/components/SafeImage";
import { resizeImageFile } from "@/lib/client-image-resize";
import { isValidImageUrl } from "@/lib/image-utils";
import { api } from "@/lib/api-client";
import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  required,
  disabled,
  hint = "Take a photo on your phone or choose from your gallery.",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file || disabled) return;

    setError("");
    setUploading(true);

    try {
      const resized = await resizeImageFile(file);
      const { url } = await api.farmer.upload(resized, `${file.name.replace(/\.\w+$/, "")}.jpg`);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">{label}</label>
      <p className="mb-3 text-xs text-harvest-brown/70">{hint}</p>

      {value && isValidImageUrl(value) && (
        <div className="relative mb-3 h-36 w-full max-w-xs overflow-hidden rounded-xl border border-harvest-tan/60 bg-harvest-parchment/30">
          <SafeImage src={value} alt="" fill className="object-cover" sizes="320px" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-harvest-green px-4 py-2 text-sm font-semibold text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
        >
          {uploading ? "Uploading..." : value ? "Change photo" : "Take or upload photo"}
        </button>
        {value && (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
            className="rounded-full border border-harvest-tan px-4 py-2 text-sm text-harvest-brown hover:border-harvest-green hover:text-harvest-green disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowUrlInput((open) => !open)}
        className="mt-3 text-xs text-harvest-brown/70 hover:text-harvest-green"
      >
        {showUrlInput ? "Hide image link option" : "Or paste an image link instead"}
      </button>

      {showUrlInput && (
        <input
          type="url"
          value={value}
          required={required && !value}
          disabled={disabled || uploading}
          placeholder="https://..."
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-harvest-tan px-4 py-2.5 text-sm outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
        />
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
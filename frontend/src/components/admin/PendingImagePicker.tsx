"use client";

import { useEffect, useRef } from "react";

export type PendingImage = {
  file: File;
  altText: string;
  previewUrl: string;
};

function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export default function PendingImagePicker({
  images,
  onChange,
  disabled,
}: {
  images: PendingImage[];
  onChange: (images: PendingImage[]) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const next: PendingImage[] = files.map((file) => ({
      file,
      altText: stripExtension(file.name),
      previewUrl: URL.createObjectURL(file),
    }));

    onChange([...images, ...next]);
    e.target.value = "";
  }

  function removeAt(index: number) {
    const target = images[index];
    URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((_, i) => i !== index));
  }

  function updateAltText(index: number, altText: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, altText } : img)));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={handleFilesSelected}
        className="font-mono text-xs"
      />
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <div key={img.previewUrl} className="flex items-center gap-2">
              <img src={img.previewUrl} alt="" className="w-12 h-12 object-cover rounded-sm border border-ink/10 shrink-0" />
              <input
                value={img.altText}
                onChange={(e) => updateAltText(i, e.target.value)}
                placeholder="alt text (required)"
                disabled={disabled}
                className="border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body text-sm focus:outline-none focus:border-rose-bold flex-1"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(i)}
                className="font-mono text-[10px] text-rose-bold hover:underline shrink-0 disabled:opacity-50"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

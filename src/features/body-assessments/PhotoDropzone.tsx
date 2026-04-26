'use client';

import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/design-system';
import type { AssessmentPhotoPosition } from '@/core/domain';
import type { PhotoSlots } from './types';
import { PHOTO_POSITIONS } from './types';

export interface PhotoDropzoneProps {
  slots: PhotoSlots;
  onChange: (next: PhotoSlots) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Four-position photo dropzone. Each position is independent: the trainer can
 * drop or click-to-select, preview the image, and either replace or remove it
 * before saving. We keep object URLs in component-managed state so changing a
 * single slot doesn't recreate previews for the others.
 */
export function PhotoDropzone({ slots, onChange, disabled }: PhotoDropzoneProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PHOTO_POSITIONS.map((p) => (
        <Slot
          key={p.value}
          position={p.value}
          label={p.label}
          slot={slots[p.value]}
          disabled={disabled}
          onPick={(file) => onChange(replaceSlot(slots, p.value, file))}
          onRemove={() => onChange(removeSlot(slots, p.value))}
        />
      ))}
    </div>
  );
}

function Slot({
  position,
  label,
  slot,
  disabled,
  onPick,
  onRemove,
}: {
  position: AssessmentPhotoPosition;
  label: string;
  slot: PhotoSlots[AssessmentPhotoPosition];
  disabled?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage =
    !slot.marked_for_deletion && (slot.preview_url || slot.pending_file);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      window.alert('Formato inválido. Use JPG, PNG, WebP ou HEIC.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      window.alert('Arquivo maior que 10 MB.');
      return;
    }
    onPick(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div
      className={[
        'group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 transition-colors',
        !disabled && 'hover:border-primary/40 hover:bg-muted/50',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
    >
      {hasImage && slot.preview_url ? (
        <>
          {/* Image previews are private signed URLs / blob URLs — next/image
              can't optimize them, so a plain <img> is the right call. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.preview_url}
            alt={`Foto ${label.toLowerCase()}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-2 py-1.5">
            <p className="text-xs font-medium text-white">{label}</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Substituir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={disabled}
              onClick={onRemove}
            >
              Remover
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 py-4 text-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadIcon />
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            Clique ou arraste a foto
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleChange}
        // The `position` data isn't strictly needed by the input but helps when
        // debugging via dev tools or screen readers iterating slots.
        data-position={position}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-muted-foreground"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14a2 2 0 0 0 2-2v-4" />
      <path d="M3 15v4a2 2 0 0 0 2 2" />
    </svg>
  );
}

// ─── Slot mutators (pure) ───────────────────────────────────────────────────

function replaceSlot(
  slots: PhotoSlots,
  position: AssessmentPhotoPosition,
  file: File
): PhotoSlots {
  const previous = slots[position];
  // Revoke any previous object URL we created locally, otherwise we leak.
  if (previous.pending_file && previous.preview_url) {
    URL.revokeObjectURL(previous.preview_url);
  }
  return {
    ...slots,
    [position]: {
      // Preserve the saved id so we know whether to update or insert.
      id: previous.id,
      storage_path: previous.storage_path,
      pending_file: file,
      preview_url: URL.createObjectURL(file),
      marked_for_deletion: false,
    },
  };
}

function removeSlot(
  slots: PhotoSlots,
  position: AssessmentPhotoPosition
): PhotoSlots {
  const previous = slots[position];
  if (previous.pending_file && previous.preview_url) {
    URL.revokeObjectURL(previous.preview_url);
  }
  if (previous.id) {
    // Saved row → defer the delete to the persistence pass.
    return {
      ...slots,
      [position]: {
        ...previous,
        pending_file: null,
        preview_url: null,
        marked_for_deletion: true,
      },
    };
  }
  // Pending-only slot → drop it locally.
  return {
    ...slots,
    [position]: {
      id: null,
      storage_path: null,
      pending_file: null,
      preview_url: null,
      marked_for_deletion: false,
    },
  };
}

"use client";

import { useId, useRef, useState } from "react";
import { getAdminIdToken } from "@/lib/admin/token";
import { Button } from "./Button";
import styles from "./MediaUpload.module.css";

export interface UploadedMedia {
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  publicId: string;
}

type MediaKind = "image" | "audio" | "video";

interface MediaUploadProps {
  kind: MediaKind;
  label: string;
  /** Subcarpeta dentro de `supernoba/`, p. ej. "obras". */
  folder: string;
  /** URL actual (para la vista previa de la imagen o del audio). */
  value?: string;
  onUploaded: (media: UploadedMedia) => void;
  disabled?: boolean;
}

const MB = 1024 * 1024;
const limits: Record<MediaKind, { bytes: number; accept: string; text: string }> = {
  image: { bytes: 25 * MB, accept: "image/*", text: "imagen" },
  audio: { bytes: 20 * MB, accept: "audio/*", text: "audio" },
  video: { bytes: 50 * MB, accept: "video/*", text: "video" },
};

interface Signature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

async function requestSignature(folder: string, resourceType: "image" | "video"): Promise<Signature> {
  const idToken = await getAdminIdToken();
  const res = await fetch("/api/admin/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, folder, resourceType }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<Signature> & { error?: string };
  if (!res.ok) throw new Error(data.error || "No se pudo preparar la subida.");
  return data as Signature;
}

function sendToCloudinary(
  file: File,
  sig: Signature,
  resourceType: "image" | "video",
  onProgress: (fraction: number) => void,
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new Error("Falló la conexión durante la subida."));
    // Sin respuesta en 5 minutos (archivos grandes con red lenta) se cancela con un mensaje claro
    xhr.timeout = 5 * 60 * 1000;
    xhr.ontimeout = () => reject(new Error("La subida tardó demasiado. Revisa tu conexión e intenta de nuevo."));
    xhr.onload = () => {
      let data: { secure_url?: string; width?: number; height?: number; duration?: number; public_id?: string; error?: { message?: string } } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // la respuesta no era JSON; se informa abajo
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url && data.public_id) {
        resolve({
          url: data.secure_url,
          width: data.width,
          height: data.height,
          duration: data.duration,
          publicId: data.public_id,
        });
      } else {
        reject(new Error(data.error?.message || "Cloudinary rechazó el archivo."));
      }
    };
    xhr.send(form);
  });
}

/** Sube una imagen, un audio o un video directo a Cloudinary con firma del servidor. */
export function MediaUpload({ kind, label, folder, value, onUploaded, disabled }: MediaUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const limit = limits[kind];
  const uploading = progress !== null;

  const handleFile = async (file: File) => {
    setError(null);
    const typeOk = file.type.startsWith(`${kind}/`);
    if (!typeOk) {
      setError(`El archivo no es ${kind === "image" ? "una imagen" : kind === "audio" ? "un audio" : "un video"}.`);
      return;
    }
    if (file.size > limit.bytes) {
      setError(`El archivo pesa ${(file.size / MB).toFixed(1)} MB; el máximo para ${limit.text} es ${limit.bytes / MB} MB.`);
      return;
    }
    const resourceType = kind === "image" ? "image" : "video";
    setProgress(0);
    try {
      const sig = await requestSignature(folder, resourceType);
      const media = await sendToCloudinary(file, sig, resourceType, setProgress);
      onUploaded(media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el archivo.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.root}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
      </span>
      {value && kind === "image" ? (
        // Vista previa de un archivo de Cloudinary recién elegido: no necesita optimización de next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.preview} src={value} alt="" />
      ) : null}
      {value && kind === "audio" ? <audio className={styles.audio} src={value} controls preload="none" /> : null}
      {value && kind === "video" ? <video className={styles.preview} src={value} controls preload="metadata" /> : null}
      <div className={styles.row}>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={limit.accept}
          className={styles.file}
          disabled={disabled || uploading}
          aria-labelledby={`${id}-label`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button variant="quiet" small disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {value ? "Cambiar archivo" : "Elegir archivo"}
        </Button>
        <span className={styles.limit}>Máx. {limit.bytes / MB} MB</span>
      </div>
      {uploading ? (
        <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress ?? 0) * 100)} aria-label="Avance de la subida">
          <span className={styles.bar} style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
        </div>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

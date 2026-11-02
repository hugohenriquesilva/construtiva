import { File } from "expo-file-system";
import { traceServiceUpload, traceServiceUploadFailure } from "./serviceUploadTrace";

type ImageFormat = {
  contentType: string;
  extension: string;
};

export const IMAGE_UPLOAD_DIAGNOSTIC_VERSION = "image-upload-diagnostic-2026-10-31-v1";

export type ImageFileData = ImageFormat & {
  bytes: Uint8Array;
  byteLength: number;
  signature: string;
};

type ImageUploadErrorCode =
  | "unreadable"
  | "unsupported"
  | "size-mismatch"
  | "upload-failed"
  | "verification-failed";

const imageUploadMessages: Record<ImageUploadErrorCode, string> = {
  unreadable: "Não foi possível ler a foto selecionada. Selecione outra imagem.",
  unsupported: "O arquivo selecionado não é uma imagem compatível. Escolha outra foto.",
  "size-mismatch": "A foto mudou durante a leitura. Selecione-a novamente.",
  "upload-failed": "Não foi possível enviar a foto selecionada. Tente novamente.",
  "verification-failed": "Não foi possível verificar a fotografia enviada. Tente novamente.",
};

export class ImageUploadError extends Error {
  constructor(readonly code: ImageUploadErrorCode, options?: { cause?: unknown }) {
    super(imageUploadMessages[code]);
    this.name = "ImageUploadError";
    if (options && "cause" in options) {
      Object.defineProperty(this, "cause", { value: options.cause, configurable: true });
    }
  }
}

function matchesAscii(bytes: Uint8Array, offset: number, value: string): boolean {
  return [...value].every((character, index) => bytes[offset + index] === character.charCodeAt(0));
}

export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes.length >= 8
    && bytes[0] === 0x89
    && matchesAscii(bytes, 1, "PNG")
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12
    && matchesAscii(bytes, 0, "RIFF")
    && matchesAscii(bytes, 8, "WEBP")
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }

  if (bytes.length >= 12 && matchesAscii(bytes, 4, "ftyp")) {
    if (matchesAscii(bytes, 8, "avif") || matchesAscii(bytes, 8, "avis")) {
      return { contentType: "image/avif", extension: "avif" };
    }

    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"].some(
      (brand) => matchesAscii(bytes, 8, brand),
    )) {
      return { contentType: "image/heic", extension: "heic" };
    }

    if (matchesAscii(bytes, 8, "mif1") || matchesAscii(bytes, 8, "msf1")) {
      return { contentType: "image/heif", extension: "heif" };
    }
  }

  return null;
}

export async function readImageFile(uri: string): Promise<ImageFileData> {
  traceServiceUpload("readImageFile", "started", {
    version: IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
  });
  let currentStage = "local-file-create";
  try {
    traceServiceUpload(currentStage, "started");
    const file = new File(uri);
    traceServiceUpload(currentStage, "completed");
    currentStage = "local-file-stat";
    traceServiceUpload(currentStage, "started");
    const exists = file.exists;
    const fileSize = file.size;
    traceServiceUpload("local-file-stat", "completed", {
      exists,
      fileSize,
    });
    if (!exists || fileSize <= 0) {
      throw new ImageUploadError("unreadable");
    }

    currentStage = "File.bytes";
    traceServiceUpload(currentStage, "started", { fileSize });
    const bytes = await file.bytes();
    const format = detectImageFormat(bytes);
    const signature = format?.contentType ?? "unknown";
    traceServiceUpload("File.bytes", "completed", {
      version: IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
      fileSize: file.size,
      byteLength: bytes.byteLength,
      signature,
      contentType: format?.contentType ?? null,
      byteArrayType: bytes.constructor.name,
      byteOffset: bytes.byteOffset,
      backingBufferByteLength: bytes.buffer.byteLength,
    });

    if (bytes.length === 0 || bytes.length !== file.size) {
      throw new ImageUploadError("unreadable");
    }

    currentStage = "image-signature-validation";
    traceServiceUpload(currentStage, "started", {
      byteLength: bytes.byteLength,
      signature,
    });
    if (!format) {
      throw new ImageUploadError("unsupported");
    }
    traceServiceUpload(currentStage, "completed", { format: format.contentType });

    const image = { bytes, byteLength: bytes.byteLength, signature, ...format };
    traceServiceUpload("readImageFile", "completed", {
      byteLength: image.byteLength,
      format: image.contentType,
    });
    return image;
  } catch (error) {
    traceServiceUploadFailure(currentStage, error);
    if (error instanceof ImageUploadError) throw error;
    throw new ImageUploadError("unreadable", { cause: error });
  }
}

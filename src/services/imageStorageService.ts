import {
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes,
  type FullMetadata,
  type UploadResult,
} from "firebase/storage";

import { storage } from "../../firebaseConfig";
import { uriToBlob } from "../utils/UriToBlob";
import {
  IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
  type ImageFileData,
  ImageUploadError,
  readImageFile,
} from "../utils/readImageFile";
import {
  traceServiceUpload,
  traceServiceUploadFailure,
} from "../utils/serviceUploadTrace";

type UploadImageData = Uint8Array | Blob;

function isBlobData(data: UploadImageData): data is Blob {
  return typeof Blob !== "undefined" && data instanceof Blob;
}

export async function uploadImageToStorage(uri: string, pathWithoutExtension: string): Promise<string> {
  traceServiceUpload("uploadImageToStorage", "started", {
    version: IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
  });
  let image: ImageFileData;
  try {
    image = await readImageFile(uri);
  } catch (error) {
    traceServiceUploadFailure("uploadImageToStorage:readImageFile", error);
    throw error;
  }
  return uploadImageData(image, pathWithoutExtension, image.bytes);
}

export async function uploadServiceImageToStorage(
  uri: string,
  pathWithoutExtension: string,
): Promise<string> {
  traceServiceUpload("uploadServiceImageToStorage", "started", {
    version: IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
  });
  let image: ImageFileData;
  try {
    image = await readImageFile(uri);
  } catch (error) {
    traceServiceUploadFailure("uploadServiceImageToStorage:readImageFile", error);
    throw error;
  }

  traceServiceUpload("service-image-blob-read", "started");
  let blob: Blob;
  try {
    blob = await uriToBlob(uri);
  } catch (error) {
    traceServiceUploadFailure("service-image-blob-read", error);
    throw new ImageUploadError("unreadable", { cause: error });
  }

  const blobIsValid = isBlobData(blob);
  const blobSize = blobIsValid ? blob.size : null;
  traceServiceUpload("service-image-blob-read", "completed", {
    isBlob: blobIsValid,
    blobSize,
    blobType: blobIsValid ? blob.type || null : null,
    expectedByteLength: image.byteLength,
  });
  if (!blobIsValid || blobSize !== image.byteLength) {
    traceServiceUpload("service-image-blob-validation", "failed", {
      errorCode: "size-mismatch",
      isBlob: blobIsValid,
      blobSize,
      expectedByteLength: image.byteLength,
    });
    throw new ImageUploadError("size-mismatch");
  }

  traceServiceUpload("service-image-blob-validation", "completed", {
    byteLength: blob.size,
    format: image.contentType,
  });
  return uploadImageData(image, pathWithoutExtension, blob);
}

async function uploadImageData(
  image: ImageFileData,
  pathWithoutExtension: string,
  data: UploadImageData,
): Promise<string> {
  traceServiceUpload("storage-ref", "started");
  let imageRef;
  try {
    imageRef = ref(storage, `${pathWithoutExtension}.${image.extension}`);
  } catch (error) {
    traceServiceUploadFailure("storage-ref", error);
    throw new ImageUploadError("upload-failed", { cause: error });
  }
  traceServiceUpload("storage-ref", "completed");

  traceServiceUpload("uploadBytes", "started", {
    version: IMAGE_UPLOAD_DIAGNOSTIC_VERSION,
    byteLength: isBlobData(data) ? data.size : data.byteLength,
    signature: image.signature,
    expectedContentType: image.contentType,
    uploadedDataType: data.constructor.name,
    uploadedDataByteOffset: data instanceof Uint8Array ? data.byteOffset : null,
    uploadedDataBufferByteLength: data instanceof Uint8Array ? data.buffer.byteLength : null,
    metadataArgumentPresent: true,
    metadataContentType: image.contentType,
  });

  let uploadPromise: Promise<UploadResult>;
  try {
    uploadPromise = uploadBytes(imageRef, data, {
      contentType: image.contentType,
    });
  } catch (error) {
    traceServiceUploadFailure("uploadBytes-invocation", error);
    throw new ImageUploadError("upload-failed", { cause: error });
  }

  let uploadResult: UploadResult;
  try {
    uploadResult = await uploadPromise;
  } catch (error) {
    traceServiceUploadFailure("uploadBytes-settlement", error);
    throw new ImageUploadError("upload-failed", { cause: error });
  }

  const uploadMetadata = uploadResult.metadata;
  traceServiceUpload("uploadBytes", "completed", {
    expectedByteLength: isBlobData(data) ? data.size : image.byteLength,
    storedSize: uploadMetadata.size,
    expectedContentType: image.contentType,
    storedContentType: uploadMetadata.contentType ?? null,
  });

  let storedMetadata: FullMetadata;
  try {
    traceServiceUpload("getMetadata", "started");
    storedMetadata = await getMetadata(uploadResult.ref);
  } catch (error) {
    traceServiceUploadFailure("getMetadata", error);
    throw new ImageUploadError("verification-failed", { cause: error });
  }

  traceServiceUpload("getMetadata", "completed", {
    expectedByteLength: isBlobData(data) ? data.size : image.byteLength,
    storedSize: storedMetadata.size,
    expectedContentType: image.contentType,
    storedContentType: storedMetadata.contentType ?? null,
  });

  if (
    Number(uploadMetadata.size) !== (isBlobData(data) ? data.size : image.byteLength)
    || uploadMetadata.contentType !== image.contentType
    || Number(storedMetadata.size) !== (isBlobData(data) ? data.size : image.byteLength)
    || storedMetadata.contentType !== image.contentType
  ) {
    const error = new ImageUploadError("verification-failed");
    traceServiceUploadFailure("stored-image-verification", error);
    throw error;
  }

  try {
    traceServiceUpload("getDownloadURL", "started");
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    traceServiceUpload("getDownloadURL", "completed");
    traceServiceUpload("uploadImageData", "completed", {
      byteLength: isBlobData(data) ? data.size : image.byteLength,
      format: image.contentType,
    });
    return downloadUrl;
  } catch (error) {
    traceServiceUploadFailure("getDownloadURL", error);
    throw new ImageUploadError("upload-failed", { cause: error });
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { savePortfolio } from "../src/services/portfolioService";
import { createService } from "../src/services/serviceService";
import {
  uploadImageToStorage,
  uploadServiceImageToStorage,
} from "../src/services/imageStorageService";
import { detectImageFormat, ImageUploadError, readImageFile } from "../src/utils/readImageFile";
import { traceServiceUploadFailure } from "../src/utils/serviceUploadTrace";
import type { ProfessionalFormData } from "../types/professionalForm";

const mocks = vi.hoisted(() => ({
  bytes: new Uint8Array(),
  uploadedMetadata: { size: 0, contentType: "" },
  reportedSize: 0,
  fileExists: true,
  readFailure: false,
  blobReadFailure: false,
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  uriToBlob: vi.fn(),
  getMetadata: vi.fn(),
  getDownloadURL: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  writeBatch: vi.fn(),
  batchSet: vi.fn(),
  batchUpdate: vi.fn(),
  batchCommit: vi.fn(),
}));

vi.mock("expo-file-system", () => ({
  File: class {
    constructor(readonly uri: string) {}

    get exists() {
      return mocks.fileExists;
    }

    get size() {
      return mocks.reportedSize;
    }

    async bytes() {
      if (mocks.readFailure) throw new Error("local read failed");
      return mocks.bytes;
    }
  },
}));

vi.mock("../src/utils/UriToBlob", () => ({
  uriToBlob: mocks.uriToBlob,
}));

vi.mock("firebase/storage", () => ({
  ref: mocks.ref,
  uploadBytes: mocks.uploadBytes,
  getMetadata: mocks.getMetadata,
  getDownloadURL: mocks.getDownloadURL,
  deleteObject: vi.fn(),
  listAll: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  Timestamp: class {},
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  serverTimestamp: mocks.serverTimestamp,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  writeBatch: mocks.writeBatch,
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn(),
}));

vi.mock("../firebaseConfig", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
  storage: {},
}));

const jpegBytes = () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);

function portfolioForm(
  overrides: Partial<ProfessionalFormData> = {},
): ProfessionalFormData {
  return {
    photoUri: "https://storage.example/avatar.jpg",
    isActive: true,
    mainProfessionId: "painter",
    secondaryProfessionIds: [],
    displayName: "Profissional",
    whatsappPhoneNumber: "11999999999",
    hasCnpj: false,
    cnpj: "",
    experienceRange: "1-3",
    zipCode: "00000000",
    street: "Rua",
    neighborhood: "Bairro",
    city: "Cidade",
    radiusKm: 20,
    aboutMe: "Sobre",
    servicePhotos: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.bytes = jpegBytes();
  mocks.reportedSize = mocks.bytes.length;
  mocks.fileExists = true;
  mocks.readFailure = false;
  mocks.blobReadFailure = false;
  mocks.uploadedMetadata = { size: 0, contentType: "" };
  mocks.ref.mockImplementation((_storage, path) => ({ path }));
  mocks.uriToBlob.mockImplementation(async () => {
    if (mocks.blobReadFailure) throw new Error("local blob read failed");
    return new Blob(["x".repeat(mocks.reportedSize)], { type: "image/jpeg" });
  });
  mocks.uploadBytes.mockImplementation(async (imageRef, data, metadata) => {
    mocks.uploadedMetadata = {
      size: data instanceof Blob ? data.size : data.byteLength,
      contentType: metadata.contentType,
    };
    return { ref: imageRef, metadata: mocks.uploadedMetadata };
  });
  mocks.getMetadata.mockImplementation(async (imageRef) => ({
    ...mocks.uploadedMetadata,
    ref: imageRef,
  }));
  mocks.getDownloadURL.mockImplementation(async (imageRef) => `download:${imageRef.path}`);
  mocks.addDoc.mockResolvedValue({ id: "service-1" });
  mocks.collection.mockReturnValue("services");
  mocks.serverTimestamp.mockReturnValue("server timestamp");
  mocks.doc.mockImplementation((_db, ...segments: string[]) => segments.join("/"));
  mocks.getDoc.mockResolvedValue({ data: () => ({ role: "professional" }) });
  mocks.writeBatch.mockReturnValue({
    set: mocks.batchSet,
    update: mocks.batchUpdate,
    commit: mocks.batchCommit,
  });
  mocks.batchCommit.mockResolvedValue(undefined);
});

describe("image file validation and upload", () => {
  it("logs safe transport error metadata without logging the original message", () => {
    const cause = Object.assign(new Error("sensitive response text"), {
      status: 503,
      code: "storage/unknown",
    });
    cause.stack = [
      "Error: sensitive response text",
      "    at uploadBytes (https://example.invalid/secret-token)",
      "    at Object.send (C:\\private\\users\\uid-123\\bundle.js:42:7)",
    ].join("\n");
    const error = Object.assign(new Error("sensitive outer message"), {
      code: "upload-failed",
      cause,
    });
    error.stack = [
      "Error: sensitive outer message",
      "    at uploadImageToStorage (file:///private/uid-456/imageStorageService.ts:10:2)",
    ].join("\n");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    traceServiceUploadFailure("uploadBytes", error);

    expect(consoleError).toHaveBeenCalledWith("[ServiceUploadTrace]", {
      traceId: "service-upload-trace-2026-10-31-v1",
      stage: "uploadBytes",
      status: "failed",
      stackFrames: ["uploadImageToStorage"],
      errorType: "Error",
      errorConstructor: "Error",
      errorCode: "upload-failed",
      causeType: "Error",
      causeConstructor: "Error",
      causeCode: "storage/unknown",
      causeHttpStatus: 503,
      causeStackFrames: ["uploadBytes", "Object.send"],
    });
    expect(JSON.stringify(consoleError.mock.calls))
      .not.toMatch(/sensitive|example\.invalid|secret-token|private|uid-123|uid-456/);
    consoleError.mockRestore();
  });

  it("recognizes supported image signatures and their real MIME types", () => {
    expect(detectImageFormat(jpegBytes())).toEqual({ contentType: "image/jpeg", extension: "jpg" });
    expect(detectImageFormat(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
      .toEqual({ contentType: "image/png", extension: "png" });
    expect(detectImageFormat(new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]))).toEqual({ contentType: "image/webp", extension: "webp" });
    expect(detectImageFormat(new Uint8Array([
      0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
    ]))).toEqual({ contentType: "image/heic", extension: "heic" });
    expect(detectImageFormat(new Uint8Array([0x3c, 0x73, 0x76, 0x67]))).toBeNull();
  });

  it("reads and preserves the exact image bytes", async () => {
    const result = await readImageFile("file:///local/photo");

    expect(result.bytes).toEqual(jpegBytes());
    expect(result.contentType).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
  });

  it("rejects a failed local file read without calling Storage", async () => {
    mocks.readFailure = true;

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "unreadable" });
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("rejects a byte count that does not match the local file size", async () => {
    mocks.reportedSize += 1;

    await expect(readImageFile("file:///local/photo"))
      .rejects.toMatchObject({ code: "unreadable" });
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
  });

  it.each([
    ["empty file", new Uint8Array(), true, "unreadable"],
    ["missing file", jpegBytes(), false, "unreadable"],
    ["non-image content", new Uint8Array([1, 2, 3, 4]), true, "unsupported"],
  ] as const)("rejects %s before upload", async (_label, bytes, exists, code) => {
    mocks.bytes = bytes;
    mocks.fileExists = exists;

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code });
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("uploads the original bytes with a detected extension and content type", async () => {
    const url = await uploadImageToStorage("file:///local/photo", "services/user/photo");

    expect(url).toBe("download:services/user/photo.jpg");
    expect(mocks.uploadBytes).toHaveBeenCalledWith(
      { path: "services/user/photo.jpg" },
      jpegBytes(),
      { contentType: "image/jpeg" },
    );
    expect(mocks.getMetadata).toHaveBeenCalledWith({ path: "services/user/photo.jpg" });
    expect(mocks.getDownloadURL).toHaveBeenCalledTimes(1);
  });

  it("sends a PNG using PNG bytes, extension, and metadata", async () => {
    mocks.bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    mocks.reportedSize = mocks.bytes.length;

    await uploadImageToStorage("file:///local/photo", "services/user/photo");

    expect(mocks.ref).toHaveBeenCalledWith({}, "services/user/photo.png");
    expect(mocks.uploadBytes).toHaveBeenCalledWith(
      { path: "services/user/photo.png" },
      mocks.bytes,
      { contentType: "image/png" },
    );
  });

  it("uploads a JPEG service photo as an XHR-produced Blob with detected metadata", async () => {
    await uploadServiceImageToStorage("file:///local/photo", "services/user/photo");

    const [, uploadedBlob, metadata] = mocks.uploadBytes.mock.calls[0];
    expect(uploadedBlob).toBeInstanceOf(Blob);
    expect(uploadedBlob.size).toBe(jpegBytes().byteLength);
    expect(mocks.uriToBlob).toHaveBeenCalledWith("file:///local/photo");
    expect(metadata).toEqual({ contentType: "image/jpeg" });
    expect(mocks.getMetadata).toHaveBeenCalledWith({ path: "services/user/photo.jpg" });
  });

  it("uploads a PNG service photo as a Blob with PNG metadata", async () => {
    mocks.bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    mocks.reportedSize = mocks.bytes.length;

    await uploadServiceImageToStorage("file:///local/photo", "services/user/photo");

    const [, uploadedBlob, metadata] = mocks.uploadBytes.mock.calls[0];
    expect(uploadedBlob).toBeInstanceOf(Blob);
    expect(uploadedBlob.size).toBe(mocks.bytes.byteLength);
    expect(metadata).toEqual({ contentType: "image/png" });
    expect(mocks.ref).toHaveBeenCalledWith({}, "services/user/photo.png");
  });

  it("rejects a failed XHR Blob read before calling Storage", async () => {
    mocks.blobReadFailure = true;

    await expect(uploadServiceImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "unreadable" });
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("rejects a failed File.bytes read before requesting the XHR Blob", async () => {
    mocks.readFailure = true;

    await expect(uploadServiceImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "unreadable" });
    expect(mocks.uriToBlob).not.toHaveBeenCalled();
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("rejects a Blob whose size differs from the validated File.bytes result", async () => {
    mocks.uriToBlob.mockResolvedValueOnce(new Blob(["x"], { type: "image/jpeg" }));

    await expect(uploadServiceImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "size-mismatch" });
    expect(mocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("does not publish a service image when Storage rejects the Blob", async () => {
    mocks.uploadBytes.mockRejectedValueOnce(new Error("storage failure"));

    await expect(uploadServiceImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toBeInstanceOf(ImageUploadError);
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("rejects a service Blob when stored metadata does not match", async () => {
    mocks.getMetadata.mockResolvedValueOnce({
      size: 14,
      contentType: "application/octet-stream",
    });

    await expect(uploadServiceImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "verification-failed" });
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("does not fetch a download URL if the Storage upload fails", async () => {
    mocks.uploadBytes.mockRejectedValueOnce(new Error("storage failure"));

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toBeInstanceOf(ImageUploadError);
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("rejects a stored size mismatch and does not request a download URL", async () => {
    mocks.getMetadata.mockResolvedValueOnce({
      size: 14,
      contentType: "application/octet-stream",
    });

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "verification-failed" });
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("rejects an uploadBytes metadata mismatch even if getMetadata reports the expected object", async () => {
    mocks.uploadBytes.mockImplementationOnce(async (imageRef) => ({
      ref: imageRef,
      metadata: { size: 14, contentType: "application/octet-stream" },
    }));

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "verification-failed" });
    expect(mocks.getMetadata).toHaveBeenCalled();
    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
  });

  it("does not resolve a download URL when URL retrieval fails", async () => {
    mocks.getDownloadURL.mockRejectedValueOnce(new Error("download URL unavailable"));

    await expect(uploadImageToStorage("file:///local/photo", "services/user/photo"))
      .rejects.toMatchObject({ code: "upload-failed" });
  });

  it("keeps a service without photos valid", async () => {
    await createService({
      title: "Teste",
      areas: ["Pintura"],
      professionId: "painter",
      description: "Descrição",
      cep: "00000000",
      location: "Cidade",
      deadline: null,
      photos: [],
      aiReview: { verdict: "approved", originalDescription: "Descrição" },
    });

    expect(mocks.uploadBytes).not.toHaveBeenCalled();
    expect(mocks.addDoc.mock.calls[0][1].photos).toEqual([]);
  });

  it("uploads every service photo and only persists completed download URLs", async () => {
    await createService({
      title: "Teste",
      areas: ["Pintura"],
      professionId: "painter",
      description: "Descrição",
      cep: "00000000",
      location: "Cidade",
      deadline: null,
      photos: ["file:///local/first", "file:///local/second"],
      aiReview: { verdict: "approved", originalDescription: "Descrição" },
    });

    expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
    expect(mocks.uploadBytes.mock.calls.every(([, data]) => data instanceof Blob)).toBe(true);
    expect(mocks.addDoc.mock.calls[0][1].photos).toEqual([
      expect.stringMatching(/^download:services\/user-1\/\d+-0\.jpg$/),
      expect.stringMatching(/^download:services\/user-1\/\d+-1\.jpg$/),
    ]);
  });

  it("does not publish the service document if the XHR Blob size differs", async () => {
    mocks.uriToBlob.mockResolvedValueOnce(new Blob(["x"], { type: "image/jpeg" }));

    await expect(createService({
      title: "Teste",
      areas: ["Pintura"],
      professionId: "painter",
      description: "Descrição",
      cep: "00000000",
      location: "Cidade",
      deadline: null,
      photos: ["file:///local/changed"],
      aiReview: { verdict: "approved", originalDescription: "Descrição" },
    })).rejects.toMatchObject({ code: "size-mismatch" });

    expect(mocks.uploadBytes).not.toHaveBeenCalled();
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it("does not publish the service document if a photo upload fails", async () => {
    mocks.uploadBytes.mockRejectedValueOnce(new Error("storage failure"));

    await expect(createService({
      title: "Teste",
      areas: ["Pintura"],
      professionId: "painter",
      description: "Descrição",
      cep: "00000000",
      location: "Cidade",
      deadline: null,
      photos: ["file:///local/invalid"],
      aiReview: { verdict: "approved", originalDescription: "Descrição" },
    })).rejects.toBeInstanceOf(ImageUploadError);

    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it("uploads new JPEG avatar and service photos as validated XHR Blobs", async () => {
    await savePortfolio(portfolioForm({
      photoUri: "file:///local/avatar",
      servicePhotos: [null, "file:///local/work"],
    }));

    expect(mocks.uploadBytes).toHaveBeenCalledTimes(2);
    expect(mocks.uploadBytes.mock.calls.map(([imageRef]) => imageRef.path).sort()).toEqual([
      "portfolios/user-1/avatar.jpg",
      "portfolios/user-1/service_1.jpg",
    ]);
    expect(mocks.uploadBytes.mock.calls.every(([, data]) => data instanceof Blob)).toBe(true);
    expect(mocks.uriToBlob).toHaveBeenCalledTimes(2);
    expect(mocks.uploadBytes.mock.calls.every(([, data, metadata]) =>
      data instanceof Blob && data.size === jpegBytes().length && metadata.contentType === "image/jpeg",
    )).toBe(true);
    expect(mocks.batchSet.mock.calls[0][1]).toMatchObject({
      photoUri: "download:portfolios/user-1/avatar.jpg",
      servicePhotos: [null, "download:portfolios/user-1/service_1.jpg"],
    });
  });

  it("uploads a new portfolio service photo as a PNG Blob with PNG metadata", async () => {
    mocks.bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    mocks.reportedSize = mocks.bytes.length;

    await savePortfolio(portfolioForm({
      servicePhotos: [null, "file:///local/work.png"],
    }));

    const [, uploadedBlob, metadata] = mocks.uploadBytes.mock.calls[0];
    expect(uploadedBlob).toBeInstanceOf(Blob);
    expect(uploadedBlob.size).toBe(mocks.bytes.byteLength);
    expect(metadata).toEqual({ contentType: "image/png" });
    expect(mocks.batchSet.mock.calls[0][1].servicePhotos).toEqual([
      null,
      "download:portfolios/user-1/service_1.png",
    ]);
  });

  it("preserves remote photos and uploads only new local photos in their original slots", async () => {
    const existingAvatar = "https://storage.example/existing-avatar.jpg";
    const existingPhoto = "https://storage.example/existing-service.jpg";
    await savePortfolio(portfolioForm({
      photoUri: existingAvatar,
      servicePhotos: [existingPhoto, null, "file:///local/new-work"],
    }));

    expect(mocks.uploadBytes).toHaveBeenCalledTimes(1);
    expect(mocks.uriToBlob).toHaveBeenCalledTimes(1);
    expect(mocks.uriToBlob).toHaveBeenCalledWith("file:///local/new-work");
    expect(mocks.batchSet.mock.calls[0][1]).toMatchObject({
      photoUri: existingAvatar,
      servicePhotos: [
        existingPhoto,
        null,
        "download:portfolios/user-1/service_2.jpg",
      ],
    });
  });

  it("keeps an existing portfolio unchanged when saving without new images", async () => {
    const existingPhotos = [
      "https://storage.example/first.jpg",
      null,
      "https://storage.example/third.jpg",
    ];
    await savePortfolio(portfolioForm({ servicePhotos: existingPhotos }));

    expect(mocks.uploadBytes).not.toHaveBeenCalled();
    expect(mocks.uriToBlob).not.toHaveBeenCalled();
    expect(mocks.batchSet.mock.calls[0][1].servicePhotos).toEqual(existingPhotos);
  });

  it("does not save a portfolio when uploading a new photo fails", async () => {
    mocks.uploadBytes.mockRejectedValueOnce(new Error("storage failure"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(savePortfolio(portfolioForm({
      servicePhotos: ["https://storage.example/existing.jpg", "file:///local/new-work"],
    }))).rejects.toBeInstanceOf(ImageUploadError);

    expect(mocks.batchSet).not.toHaveBeenCalled();
    expect(mocks.batchCommit).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not save the portfolio when the local file and XHR Blob sizes differ", async () => {
    mocks.uriToBlob.mockResolvedValueOnce(new Blob(["x"], { type: "image/jpeg" }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(savePortfolio(portfolioForm({
      servicePhotos: ["file:///local/changed"],
    }))).rejects.toMatchObject({ code: "size-mismatch" });

    expect(mocks.uploadBytes).not.toHaveBeenCalled();
    expect(mocks.batchSet).not.toHaveBeenCalled();
    expect(mocks.batchCommit).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not save the portfolio when Storage metadata does not match the image", async () => {
    mocks.getMetadata.mockResolvedValueOnce({
      size: 14,
      contentType: "application/octet-stream",
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(savePortfolio(portfolioForm({
      servicePhotos: ["file:///local/new-work"],
    }))).rejects.toMatchObject({ code: "verification-failed" });

    expect(mocks.getDownloadURL).not.toHaveBeenCalled();
    expect(mocks.batchSet).not.toHaveBeenCalled();
    expect(mocks.batchCommit).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

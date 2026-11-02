import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServiceById } from "../src/services/serviceService";

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  Timestamp: class {},
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("../firebaseConfig", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
  storage: {},
}));

vi.mock("../src/services/imageStorageService", () => ({
  uploadServiceImageToStorage: vi.fn(),
}));

vi.mock("../src/utils/serviceUploadTrace", () => ({
  traceServiceUpload: vi.fn(),
  traceServiceUploadFailure: vi.fn(),
}));

describe("getServiceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue("service-reference");
  });

  it("uses the service ID supplied by the details route and maps the existing document", async () => {
    mocks.getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "service-42",
      data: () => ({
        ownerUid: "owner-1",
        status: "open",
        title: "Reforma",
        photos: [],
        areas: [],
      }),
    });

    await expect(getServiceById("service-42")).resolves.toMatchObject({
      id: "service-42",
      ownerUid: "owner-1",
      status: "open",
      title: "Reforma",
    });
    expect(mocks.doc).toHaveBeenCalledWith({}, "services", "service-42");
    expect(mocks.getDoc).toHaveBeenCalledWith("service-reference");
  });

  it("returns null for a document confirmed not to exist", async () => {
    mocks.getDoc.mockResolvedValueOnce({ exists: () => false });

    await expect(getServiceById("missing-service")).resolves.toBeNull();
    expect(mocks.doc).toHaveBeenCalledWith({}, "services", "missing-service");
  });

  it("propagates offline read failures instead of presenting them as missing documents", async () => {
    const offlineError = new Error(
      "FirebaseError: Failed to get document because the client is offline.",
    );
    mocks.getDoc.mockRejectedValueOnce(offlineError);

    await expect(getServiceById("service-42")).rejects.toBe(offlineError);
  });
});

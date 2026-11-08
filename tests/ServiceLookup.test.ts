import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteServiceAsAdmin, getServiceById } from "../src/services/serviceService";

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
  ref: vi.fn(),
  deleteObject: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  Timestamp: class { },
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  where: vi.fn(),
  writeBatch: mocks.writeBatch
}));


vi.mock("firebase/storage", () => ({
  ref: mocks.ref,
  deleteObject: mocks.deleteObject,
}));

vi.mock("../firebaseConfig", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
  storage: {},
}));

// Geocodificação do CEP do serviço: sem rede nos testes
vi.mock("../src/services/cepService", () => ({
  fetchAddressByCep: vi.fn(async () => ({ street: "", neighborhood: "", city: "Cidade", state: "SP" })),
}));

vi.mock("../src/services/locationService", () => ({
  geocodeAddress: vi.fn(async () => null),
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


describe("deleteServiceAsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue("service-reference");
    mocks.ref.mockImplementation((_storage, url: string) => url);
  });

  it("deletes the proposals and the service together, then the photos", async () => {
    const batch = { delete: vi.fn(), commit: vi.fn(async () => undefined) };
    mocks.writeBatch.mockReturnValue(batch);
    mocks.getDoc.mockResolvedValueOnce({
      id: "service-1",
      exists: () => true,
      data: () => ({ title: "Pintura", photos: ["https://storage/a.jpg", "https://storage/b.jpg"] }),
    });
    mocks.getDocs.mockResolvedValueOnce({ docs: [{ ref: "proposal-1" }, { ref: "proposal-2" }] });
    mocks.deleteObject.mockResolvedValue(undefined);

    await deleteServiceAsAdmin("service-1");

    expect(batch.delete.mock.calls.map(([target]) => target))
      .toEqual(["proposal-1", "proposal-2", "service-reference"]);
    expect(batch.commit).toHaveBeenCalledTimes(1);
    expect(mocks.deleteObject.mock.calls.map(([target]) => target))
      .toEqual(["https://storage/a.jpg", "https://storage/b.jpg"]);
  });

  it("does nothing when the service no longer exists", async () => {
    mocks.getDoc.mockResolvedValueOnce({ exists: () => false });
    mocks.getDocs.mockResolvedValueOnce({ docs: [] });

    await deleteServiceAsAdmin("missing");

    expect(mocks.writeBatch).not.toHaveBeenCalled();
    expect(mocks.deleteObject).not.toHaveBeenCalled();
  });
});
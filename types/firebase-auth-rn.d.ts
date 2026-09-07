import type { Persistence } from "firebase/auth";

// `@firebase/auth`'s exports map resolves TS types to the generic build before the
// "react-native" condition, so this RN-only export never shows up in the generated types.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}

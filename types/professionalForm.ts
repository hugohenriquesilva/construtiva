// Também validado nas regras do Firestore (portfolios)
export const MAX_SECONDARY_PROFESSIONS = 3;

export interface ExperienceRange {
  label: string;
  value: string;
}

export interface ProfessionalFormData {
  photoUri: string | null;
  isActive: boolean;
  mainProfessionId: string | null;
  secondaryProfessionIds: string[];
  displayName: string;
  hasCnpj: boolean;
  cnpj: string;
  experienceRange: string | null;
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  radiusKm: number;
  aboutMe: string;
  servicePhotos: (string | null)[];
}

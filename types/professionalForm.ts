export interface ExperienceRange {
  label: string;
  value: string;
}

export interface ProfessionalFormData {
  photoUri: string | null;
  isActive: boolean;
  area: string | null;
  mainProfession: string | null;
  secondaryProfessions: string[];
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

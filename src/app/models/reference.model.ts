/**
 * Types Données de référence (Pays, Secteurs, etc.)
 */

export interface Pays {
    id: string;
    libelle: string;
    codeIso: string;
    indicatifTel: string;
}

export interface Sector {
    id: string;
    libelle: string;
    description: string;
}

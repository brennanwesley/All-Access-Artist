export interface Contributor {
  legal_name: string;
  stage_name?: string | undefined;
  role: ContributorRole;
  contribution?: string | undefined;
  writer_share_percent: number;
  publisher_share_percent: number;
  pro_affiliation?: string | undefined;
  ipi_number?: string | undefined;
  publisher?: {
    company_name?: string | undefined;
    pro_affiliation?: string | undefined;
    ipi_number?: string | undefined;
  } | undefined;
}

export type ContributorRole = 
  | 'writer'
  | 'co-writer'
  | 'lyricist'
  | 'composer'
  | 'producer'
  | 'arranger'
  | 'beat-maker';

export const CONTRIBUTOR_ROLES: { value: ContributorRole; label: string }[] = [
  { value: 'writer', label: 'Writer' },
  { value: 'co-writer', label: 'Co-Writer' },
  { value: 'lyricist', label: 'Lyricist' },
  { value: 'composer', label: 'Composer' },
  { value: 'producer', label: 'Producer' },
  { value: 'arranger', label: 'Arranger' },
  { value: 'beat-maker', label: 'Beat Maker' },
];

export interface SplitSheetData {
  id?: string;
  user_id?: string;
  release_id?: string | null;
  song_title: string;
  song_aka?: string;
  artist_name: string;
  album_project: string;
  date_created: string;
  song_length?: string;
  studio_location?: string;
  additional_notes?: string;
  contributors: Contributor[];
  created_at?: string;
  updated_at?: string;
}

export interface PercentageValidation {
  writerValid: boolean;
  publisherValid: boolean;
  writerTotal: number;
  publisherTotal: number;
  isValid: boolean;
}


export enum TattooStyle {
  AMERICAN_TRADITIONAL = 'American Traditional',
  JAPANESE = 'Traditional Japanese',
  TRIBAL = 'Tribal',
  BLACK_AND_GREY = 'Black & Grey',
  NEO_TRADITIONAL = 'Neo-Traditional',
  NEW_SCHOOL = 'New School',
  REALISM_COLOR = 'Realism (Color)',
  REALISM_BW = 'Realism (Black & Grey)',
  WATERCOLOR = 'Watercolor',
  GEOMETRIC = 'Geometric',
  TRASH_POLKA = 'Trash Polka',
  ILLUSTRATIVE = 'Sketch / Illustrative',
  FINE_LINE = 'Fine Line',
  CYBER_SIGILISM = 'Cyber Sigilism',
  IGNORANT = 'Ignorant Style',
  GLITCH = 'Glitch',
  EMBROIDERY = 'Embroidery',
  CHROME = 'Chrome',
  BLACKWORK = 'Blackwork',
  BLAST_OVER = 'Blast Over',
  BIOMECHANICAL = 'Biomechanical',
  CUSTOM = 'Custom Upload'
}

export interface GeneratedDesign {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string; // Base64
  createdAt: number;
}

export type ViewState = 'generate' | 'gallery' | 'try-on';

export interface AIStudio {
  openSelectKey: () => Promise<void>;
  hasSelectedApiKey: () => Promise<boolean>;
}

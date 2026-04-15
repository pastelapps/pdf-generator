export type Depoente = {
  name: string;
  role: string;
  quote: string;
  photo: string;
};

export type SectionOverrides = {
  about?: {
    margin_top?: string;
    margin_bottom?: string;
    margin_lateral?: string;
    icon_size?: string;
    scale?: string;
  };
  audience?: {
    margin_top?: string;
    card_margin_bottom?: string;
    card_padding_vertical?: string;
    card_font_size?: string;
    icon_size?: string;
  };
  program?: {
    day_margin_top?: string;
  };
  speakers?: {
    margin_top?: string;
    force_compact?: string;
    scale?: string;
  };
};

export type ViewModel = {
  generatedAt: Date;
  editionId: string;

  course: {
    title: string;
    subtitle: string;
    slug: string;
    categoryLabel: string;
    aboutHeading: string;
    aboutSubheading: string;
    aboutCards: Array<{ icon: string; title: string; description: string }>;
    audienceHeading: string;
    audienceCards: Array<{ icon: string; title: string; description?: string }>;
    programHeading: string;
    programDescription: string;
    investmentHeading: string;
    investmentSubtitle: string;
    includedItems: Array<{ icon: string; text: string }>;
  };

  edition: {
    startDate: Date;
    endDate: Date;
    dateLabel: string;
    locationVenue: string;
    locationAddress: string;
    programDays: Array<{
      tag: string;
      time: string;
      title: string;
      topics: Array<{ text: string; children: Array<{ text: string; children: any[] }> }>;
      description: string;
      kind: 'bullets' | 'paragraph';
    }>;
  };

  instructors: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUrl: string | null;
  }>;

  layoutVariant: 'single-speaker' | 'multi-speaker';

  designSystem: {
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  };

  assets: {
    logoColorido: string;
    logoBranco: string;
    kitParticipante: string;
    instituicoes: string;
    fotosEvento: string[];
    depoentes: Depoente[];
    coverFrameUrl: string | null;
  };

  sectionOverrides: SectionOverrides;
};

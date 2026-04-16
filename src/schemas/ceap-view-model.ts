export type CeapSectionOverrides = {
  apresentacao?: {
    margin_top?: string;
    font_size?: string;
    margin_bottom?: string;
    card_padding?: string;
    card_spacing?: string;
    card_font_size?: string;
  };
  professor?: {
    margin_top?: string;
    font_scale?: string;
    card_margin_bottom?: string;
    learn_font_size?: string;
    learn_padding?: string;
  };
  programacao?: {
    date_margin_top?: string;
    bullet_padding?: string;
    font_size?: string;
  };
  capa?: {
    professor_font_size?: string;
    professor_left_margin_left?: string;
    professor_left_margin_right?: string;
    professor_right_margin_left?: string;
    professor_right_margin_right?: string;
  };
};

export type CeapViewModel = {
  generatedAt: Date;
  courseId: string;

  course: {
    title: string;
    subtitle: string;
    slug: string;
    categoryLabel: string;
    titleParts: Array<{ text: string; color: string }>;
    heroBadges: Array<{ icon: string; label: string; value: string }>;
    coverImageUrl: string | null;
    aboutHeading: string;
    aboutSubheading: string;
    aboutDescription: string;
    aboutCards: Array<{ icon: string; title: string; description: string }>;
    audienceHeading: string;
    audienceCards: Array<{ icon: string; title: string; description: string }>;
    programHeading: string;
    programDescription: string;
    programDays: Array<{
      tag: string;
      time: string;
      title: string;
      topics: Array<{ text: string; children: any[] }>;
      description: string;
      kind: 'bullets' | 'paragraph';
    }>;
    dateLabel: string;
    locationVenue: string;
    locationAddress: string;
    locationCity: string;
    investmentHeading: string;
    investmentSubtitle: string;
    includedItems: Array<{ icon: string; text: string }>;
  };

  instructors: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUrl: string | null;
  }>;

  layoutVariant: 'single-prof' | 'multi-prof';

  designSystem: {
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  };

  contato: {
    telefone1: string;
    telefone2: string;
    email: string;
    site: string;
  };

  produtoCeap: 'licittoguru' | 'plataforma' | 'monicalopes';

  propostaComercial?: {
    valor: string;
  };

  coverPhotoUrl?: string;
  professorLeftName?: string;
  professorRightName?: string;
  professorLeftMargins?: { left?: string; right?: string };
  professorRightMargins?: { left?: string; right?: string };
  professorFontSize?: string;

  assets: {
    background1: string;
    background2: string;
    backgroundE: string;
    backgroundProgramacao: string;
    kitDoAluno: string;
    medalha: string;
    licittoguru: string;
    footerPlataforma: string;
    logoCeapColorido: string;
    logoCeapBranco: string;
    backgroundFinalLicittoguru: string;
    backgroundFinalPlataforma: string;
    backgroundFinalMonicalopes: string;
    iconeAlvo: string;
    iconeCargaHoraria: string;
    iconeData: string;
    iconeLocal: string;
  };

  sectionOverrides: CeapSectionOverrides;
};

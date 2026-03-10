export interface ColorPalette {
  brand: {
    primary: string;
    secondary: string;
  };
  background: {
    primary: string;
    secondary: string;
  };
  foreground: {
    primary: string;
    secondary: string;
  };
  text: {
    main: string;
    secondary: string;
  };
  border: {
    default: string;
    ring: string;
  };
  status: {
    warning: string;
    info: string;
    error: string;
    success: string;
    destructive: string;
    destructiveForeground: string;
  };
  commons: {
    white: string;
    black: string;
    accent: string;
    muted: string;
    mutedForeground: string;
  };
}

export interface TypographyScale {
  family: {
    sans: string;
    mono: string;
    heading: string;
  };
  size: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface SpacingScale {
  spacing1: string;
  spacing2: string;
  spacing3: string;
  spacing4: string;
  spacing5: string;
  spacing6: string;
  spacing8: string;
  spacing10: string;
  spacing12: string;
  spacing16: string;
}

export interface ThemeTokens {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

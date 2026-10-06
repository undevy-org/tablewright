export type DesignTokensTheme = 'light' | 'dark';

export type DisplayToken = {
  value: string | number;
  unit?: string;
  modes?: { dark?: string | number };
};

export function displayTokenValue(token: DisplayToken, theme: DesignTokensTheme): string {
  const raw =
    theme === 'dark' && token.modes?.dark !== undefined ? token.modes.dark : token.value;

  return typeof raw === 'number' ? (token.unit ? `${raw}${token.unit}` : String(raw)) : raw;
}

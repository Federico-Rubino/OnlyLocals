export const Colors = {
  // Backgrounds
  bgLight: '#f5f7fa',
  bgDark: '#121212',
  cardBg: '#ffffff',

  // Brand palette
  primary: '#255cb3',       // main interactive: buttons, links, active chips
  primaryDark: '#1a2a4a',  // page titles, header cards, dark accents
  primaryLight: '#e8f0fd',  // tinted background for tags, badges, tab selectors

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#6b6b6b',
  textMuted: '#aaaaaa',

  // Semantic
  error: '#FF3B30',        // form validation errors (iOS standard)
  destructive: '#e53935',  // logout, delete, badges
  success: '#27ae60',      // success states, reachable rewards

  // Borders & dividers
  border: '#dddddd',
  borderLight: 'rgba(0,0,0,0.08)',
  borderInput: 'rgba(0,0,0,0.22)',

  // Input
  inputBg: '#ffffff',
  inputBorderRadius: 10,

  // Card
  cardBorderRadius: 14,
  buttonBorderRadius: 12,
} as const;

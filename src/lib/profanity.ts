const BLOCKED = [
  'fuck', 'fucker', 'fucking', 'fucks',
  'shit', 'shits', 'shitting',
  'cunt', 'cunts',
  'bitch', 'bitches',
  'nigger', 'niggers', 'nigga', 'niggas',
  'faggot', 'faggots', 'fag', 'fags',
  'whore', 'whores',
  'slut', 'sluts',
  'asshole', 'assholes', 'asses',
  'bastard', 'bastards',
  'cock', 'cocks', 'cocksucker',
  'pussy', 'pussies',
  'motherfucker', 'motherfuckers',
  'dickhead', 'dickheads',
];

export function isProfane(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[_\-\s]/g, '');
  return BLOCKED.some((w) => normalized.includes(w));
}

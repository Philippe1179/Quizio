export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemElement {
  n: number;
  sym: string;
  name: string;
  cat: ElementCategory;
  row: number; // grid row: 1-7 main table, 9 lanthanides, 10 actinides
  col: number; // grid column: 1-18
}

type C = ElementCategory;
const AM: C = 'alkali-metal';
const AE: C = 'alkaline-earth';
const TM: C = 'transition-metal';
const PT: C = 'post-transition-metal';
const ML: C = 'metalloid';
const NM: C = 'nonmetal';
const HL: C = 'halogen';
const NG: C = 'noble-gas';
const LN: C = 'lanthanide';
const AC: C = 'actinide';

export const ELEMENTS: ChemElement[] = [
  // Period 1
  { n:   1, sym: 'H',  name: 'Hydrogen',      cat: NM, row: 1, col:  1 },
  { n:   2, sym: 'He', name: 'Helium',         cat: NG, row: 1, col: 18 },
  // Period 2
  { n:   3, sym: 'Li', name: 'Lithium',        cat: AM, row: 2, col:  1 },
  { n:   4, sym: 'Be', name: 'Beryllium',      cat: AE, row: 2, col:  2 },
  { n:   5, sym: 'B',  name: 'Boron',          cat: ML, row: 2, col: 13 },
  { n:   6, sym: 'C',  name: 'Carbon',         cat: NM, row: 2, col: 14 },
  { n:   7, sym: 'N',  name: 'Nitrogen',       cat: NM, row: 2, col: 15 },
  { n:   8, sym: 'O',  name: 'Oxygen',         cat: NM, row: 2, col: 16 },
  { n:   9, sym: 'F',  name: 'Fluorine',       cat: HL, row: 2, col: 17 },
  { n:  10, sym: 'Ne', name: 'Neon',           cat: NG, row: 2, col: 18 },
  // Period 3
  { n:  11, sym: 'Na', name: 'Sodium',         cat: AM, row: 3, col:  1 },
  { n:  12, sym: 'Mg', name: 'Magnesium',      cat: AE, row: 3, col:  2 },
  { n:  13, sym: 'Al', name: 'Aluminum',       cat: PT, row: 3, col: 13 },
  { n:  14, sym: 'Si', name: 'Silicon',        cat: ML, row: 3, col: 14 },
  { n:  15, sym: 'P',  name: 'Phosphorus',     cat: NM, row: 3, col: 15 },
  { n:  16, sym: 'S',  name: 'Sulfur',         cat: NM, row: 3, col: 16 },
  { n:  17, sym: 'Cl', name: 'Chlorine',       cat: HL, row: 3, col: 17 },
  { n:  18, sym: 'Ar', name: 'Argon',          cat: NG, row: 3, col: 18 },
  // Period 4
  { n:  19, sym: 'K',  name: 'Potassium',      cat: AM, row: 4, col:  1 },
  { n:  20, sym: 'Ca', name: 'Calcium',        cat: AE, row: 4, col:  2 },
  { n:  21, sym: 'Sc', name: 'Scandium',       cat: TM, row: 4, col:  3 },
  { n:  22, sym: 'Ti', name: 'Titanium',       cat: TM, row: 4, col:  4 },
  { n:  23, sym: 'V',  name: 'Vanadium',       cat: TM, row: 4, col:  5 },
  { n:  24, sym: 'Cr', name: 'Chromium',       cat: TM, row: 4, col:  6 },
  { n:  25, sym: 'Mn', name: 'Manganese',      cat: TM, row: 4, col:  7 },
  { n:  26, sym: 'Fe', name: 'Iron',           cat: TM, row: 4, col:  8 },
  { n:  27, sym: 'Co', name: 'Cobalt',         cat: TM, row: 4, col:  9 },
  { n:  28, sym: 'Ni', name: 'Nickel',         cat: TM, row: 4, col: 10 },
  { n:  29, sym: 'Cu', name: 'Copper',         cat: TM, row: 4, col: 11 },
  { n:  30, sym: 'Zn', name: 'Zinc',           cat: TM, row: 4, col: 12 },
  { n:  31, sym: 'Ga', name: 'Gallium',        cat: PT, row: 4, col: 13 },
  { n:  32, sym: 'Ge', name: 'Germanium',      cat: ML, row: 4, col: 14 },
  { n:  33, sym: 'As', name: 'Arsenic',        cat: ML, row: 4, col: 15 },
  { n:  34, sym: 'Se', name: 'Selenium',       cat: NM, row: 4, col: 16 },
  { n:  35, sym: 'Br', name: 'Bromine',        cat: HL, row: 4, col: 17 },
  { n:  36, sym: 'Kr', name: 'Krypton',        cat: NG, row: 4, col: 18 },
  // Period 5
  { n:  37, sym: 'Rb', name: 'Rubidium',       cat: AM, row: 5, col:  1 },
  { n:  38, sym: 'Sr', name: 'Strontium',      cat: AE, row: 5, col:  2 },
  { n:  39, sym: 'Y',  name: 'Yttrium',        cat: TM, row: 5, col:  3 },
  { n:  40, sym: 'Zr', name: 'Zirconium',      cat: TM, row: 5, col:  4 },
  { n:  41, sym: 'Nb', name: 'Niobium',        cat: TM, row: 5, col:  5 },
  { n:  42, sym: 'Mo', name: 'Molybdenum',     cat: TM, row: 5, col:  6 },
  { n:  43, sym: 'Tc', name: 'Technetium',     cat: TM, row: 5, col:  7 },
  { n:  44, sym: 'Ru', name: 'Ruthenium',      cat: TM, row: 5, col:  8 },
  { n:  45, sym: 'Rh', name: 'Rhodium',        cat: TM, row: 5, col:  9 },
  { n:  46, sym: 'Pd', name: 'Palladium',      cat: TM, row: 5, col: 10 },
  { n:  47, sym: 'Ag', name: 'Silver',         cat: TM, row: 5, col: 11 },
  { n:  48, sym: 'Cd', name: 'Cadmium',        cat: TM, row: 5, col: 12 },
  { n:  49, sym: 'In', name: 'Indium',         cat: PT, row: 5, col: 13 },
  { n:  50, sym: 'Sn', name: 'Tin',            cat: PT, row: 5, col: 14 },
  { n:  51, sym: 'Sb', name: 'Antimony',       cat: ML, row: 5, col: 15 },
  { n:  52, sym: 'Te', name: 'Tellurium',      cat: ML, row: 5, col: 16 },
  { n:  53, sym: 'I',  name: 'Iodine',         cat: HL, row: 5, col: 17 },
  { n:  54, sym: 'Xe', name: 'Xenon',          cat: NG, row: 5, col: 18 },
  // Period 6
  { n:  55, sym: 'Cs', name: 'Cesium',         cat: AM, row: 6, col:  1 },
  { n:  56, sym: 'Ba', name: 'Barium',         cat: AE, row: 6, col:  2 },
  { n:  57, sym: 'La', name: 'Lanthanum',      cat: LN, row: 6, col:  3 },
  { n:  72, sym: 'Hf', name: 'Hafnium',        cat: TM, row: 6, col:  4 },
  { n:  73, sym: 'Ta', name: 'Tantalum',       cat: TM, row: 6, col:  5 },
  { n:  74, sym: 'W',  name: 'Tungsten',       cat: TM, row: 6, col:  6 },
  { n:  75, sym: 'Re', name: 'Rhenium',        cat: TM, row: 6, col:  7 },
  { n:  76, sym: 'Os', name: 'Osmium',         cat: TM, row: 6, col:  8 },
  { n:  77, sym: 'Ir', name: 'Iridium',        cat: TM, row: 6, col:  9 },
  { n:  78, sym: 'Pt', name: 'Platinum',       cat: TM, row: 6, col: 10 },
  { n:  79, sym: 'Au', name: 'Gold',           cat: TM, row: 6, col: 11 },
  { n:  80, sym: 'Hg', name: 'Mercury',        cat: TM, row: 6, col: 12 },
  { n:  81, sym: 'Tl', name: 'Thallium',       cat: PT, row: 6, col: 13 },
  { n:  82, sym: 'Pb', name: 'Lead',           cat: PT, row: 6, col: 14 },
  { n:  83, sym: 'Bi', name: 'Bismuth',        cat: PT, row: 6, col: 15 },
  { n:  84, sym: 'Po', name: 'Polonium',       cat: PT, row: 6, col: 16 },
  { n:  85, sym: 'At', name: 'Astatine',       cat: HL, row: 6, col: 17 },
  { n:  86, sym: 'Rn', name: 'Radon',          cat: NG, row: 6, col: 18 },
  // Period 7
  { n:  87, sym: 'Fr', name: 'Francium',       cat: AM, row: 7, col:  1 },
  { n:  88, sym: 'Ra', name: 'Radium',         cat: AE, row: 7, col:  2 },
  { n:  89, sym: 'Ac', name: 'Actinium',       cat: AC, row: 7, col:  3 },
  { n: 104, sym: 'Rf', name: 'Rutherfordium',  cat: TM, row: 7, col:  4 },
  { n: 105, sym: 'Db', name: 'Dubnium',        cat: TM, row: 7, col:  5 },
  { n: 106, sym: 'Sg', name: 'Seaborgium',     cat: TM, row: 7, col:  6 },
  { n: 107, sym: 'Bh', name: 'Bohrium',        cat: TM, row: 7, col:  7 },
  { n: 108, sym: 'Hs', name: 'Hassium',        cat: TM, row: 7, col:  8 },
  { n: 109, sym: 'Mt', name: 'Meitnerium',     cat: TM, row: 7, col:  9 },
  { n: 110, sym: 'Ds', name: 'Darmstadtium',   cat: TM, row: 7, col: 10 },
  { n: 111, sym: 'Rg', name: 'Roentgenium',    cat: TM, row: 7, col: 11 },
  { n: 112, sym: 'Cn', name: 'Copernicium',    cat: TM, row: 7, col: 12 },
  { n: 113, sym: 'Nh', name: 'Nihonium',       cat: PT, row: 7, col: 13 },
  { n: 114, sym: 'Fl', name: 'Flerovium',      cat: PT, row: 7, col: 14 },
  { n: 115, sym: 'Mc', name: 'Moscovium',      cat: PT, row: 7, col: 15 },
  { n: 116, sym: 'Lv', name: 'Livermorium',    cat: PT, row: 7, col: 16 },
  { n: 117, sym: 'Ts', name: 'Tennessine',     cat: HL, row: 7, col: 17 },
  { n: 118, sym: 'Og', name: 'Oganesson',      cat: NG, row: 7, col: 18 },
  // Lanthanides (row 9)
  { n:  58, sym: 'Ce', name: 'Cerium',         cat: LN, row: 9, col:  4 },
  { n:  59, sym: 'Pr', name: 'Praseodymium',   cat: LN, row: 9, col:  5 },
  { n:  60, sym: 'Nd', name: 'Neodymium',      cat: LN, row: 9, col:  6 },
  { n:  61, sym: 'Pm', name: 'Promethium',     cat: LN, row: 9, col:  7 },
  { n:  62, sym: 'Sm', name: 'Samarium',       cat: LN, row: 9, col:  8 },
  { n:  63, sym: 'Eu', name: 'Europium',       cat: LN, row: 9, col:  9 },
  { n:  64, sym: 'Gd', name: 'Gadolinium',     cat: LN, row: 9, col: 10 },
  { n:  65, sym: 'Tb', name: 'Terbium',        cat: LN, row: 9, col: 11 },
  { n:  66, sym: 'Dy', name: 'Dysprosium',     cat: LN, row: 9, col: 12 },
  { n:  67, sym: 'Ho', name: 'Holmium',        cat: LN, row: 9, col: 13 },
  { n:  68, sym: 'Er', name: 'Erbium',         cat: LN, row: 9, col: 14 },
  { n:  69, sym: 'Tm', name: 'Thulium',        cat: LN, row: 9, col: 15 },
  { n:  70, sym: 'Yb', name: 'Ytterbium',      cat: LN, row: 9, col: 16 },
  { n:  71, sym: 'Lu', name: 'Lutetium',       cat: LN, row: 9, col: 17 },
  // Actinides (row 10)
  { n:  90, sym: 'Th', name: 'Thorium',        cat: AC, row: 10, col:  4 },
  { n:  91, sym: 'Pa', name: 'Protactinium',   cat: AC, row: 10, col:  5 },
  { n:  92, sym: 'U',  name: 'Uranium',        cat: AC, row: 10, col:  6 },
  { n:  93, sym: 'Np', name: 'Neptunium',      cat: AC, row: 10, col:  7 },
  { n:  94, sym: 'Pu', name: 'Plutonium',      cat: AC, row: 10, col:  8 },
  { n:  95, sym: 'Am', name: 'Americium',      cat: AC, row: 10, col:  9 },
  { n:  96, sym: 'Cm', name: 'Curium',         cat: AC, row: 10, col: 10 },
  { n:  97, sym: 'Bk', name: 'Berkelium',      cat: AC, row: 10, col: 11 },
  { n:  98, sym: 'Cf', name: 'Californium',    cat: AC, row: 10, col: 12 },
  { n:  99, sym: 'Es', name: 'Einsteinium',    cat: AC, row: 10, col: 13 },
  { n: 100, sym: 'Fm', name: 'Fermium',        cat: AC, row: 10, col: 14 },
  { n: 101, sym: 'Md', name: 'Mendelevium',    cat: AC, row: 10, col: 15 },
  { n: 102, sym: 'No', name: 'Nobelium',       cat: AC, row: 10, col: 16 },
  { n: 103, sym: 'Lr', name: 'Lawrencium',     cat: AC, row: 10, col: 17 },
];

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali-metal':          '#7f1d1d',
  'alkaline-earth':        '#78350f',
  'transition-metal':      '#1e3a5f',
  'post-transition-metal': '#134e4a',
  'metalloid':             '#713f12',
  'nonmetal':              '#14532d',
  'halogen':               '#164e63',
  'noble-gas':             '#4a1d96',
  'lanthanide':            '#7c2d12',
  'actinide':              '#831843',
};

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal':          'Alkali Metal',
  'alkaline-earth':        'Alkaline Earth',
  'transition-metal':      'Transition Metal',
  'post-transition-metal': 'Post-Transition Metal',
  'metalloid':             'Metalloid',
  'nonmetal':              'Nonmetal',
  'halogen':               'Halogen',
  'noble-gas':             'Noble Gas',
  'lanthanide':            'Lanthanide',
  'actinide':              'Actinide',
};

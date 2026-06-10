export interface President {
  id: number;       // unique 1–45
  number: string;   // display (e.g. "22 & 24")
  name: string;
  years: string;
  party: string;
  portrait: string;
  fact: string;
}

// Portraits via Wikimedia Commons Special:FilePath redirect
const p = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=400`;

export const PRESIDENTS: President[] = [
  {
    id: 1, number: '1st', name: 'George Washington',
    years: '1789–1797', party: 'Unaffiliated',
    portrait: p('Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg'),
    fact: 'Refused a third term, establishing the two-term precedent that held for 150 years.',
  },
  {
    id: 2, number: '2nd', name: 'John Adams',
    years: '1797–1801', party: 'Federalist',
    portrait: p('John_Adams.jpg'),
    fact: 'First president to live in the White House, moving in before it was even finished.',
  },
  {
    id: 3, number: '3rd', name: 'Thomas Jefferson',
    years: '1801–1809', party: 'Democratic-Republican',
    portrait: p('Rembrandt_Peale_-_Thomas_Jefferson_-_Google_Art_Project.jpg'),
    fact: 'Authored the Declaration of Independence and nearly doubled US territory with the Louisiana Purchase.',
  },
  {
    id: 4, number: '4th', name: 'James Madison',
    years: '1809–1817', party: 'Democratic-Republican',
    portrait: p('James_Madison.jpg'),
    fact: 'Known as the Father of the Constitution; led the US through the War of 1812.',
  },
  {
    id: 5, number: '5th', name: 'James Monroe',
    years: '1817–1825', party: 'Democratic-Republican',
    portrait: p('James_Monroe_White_House_portrait_1819.jpg'),
    fact: 'His presidency was called the "Era of Good Feelings." The Monroe Doctrine warned Europe to stay out of the Americas.',
  },
  {
    id: 6, number: '6th', name: 'John Quincy Adams',
    years: '1825–1829', party: 'Democratic-Republican',
    portrait: p('John_Quincy_Adams.jpg'),
    fact: 'The only president to serve in the House of Representatives after his presidency.',
  },
  {
    id: 7, number: '7th', name: 'Andrew Jackson',
    years: '1829–1837', party: 'Democratic',
    portrait: p('Andrew_Jackson_-_3_by_Ralph_Eleaser_Whiteside_Earl_-_Hermitage.jpg'),
    fact: 'First president from west of the Appalachians. Survived two assassination attempts — both pistols misfired.',
  },
  {
    id: 8, number: '8th', name: 'Martin Van Buren',
    years: '1837–1841', party: 'Democratic',
    portrait: p('Martin_Van_Buren.jpg'),
    fact: 'First president born as a US citizen. His presidency was immediately struck by the Panic of 1837.',
  },
  {
    id: 9, number: '9th', name: 'William Henry Harrison',
    years: '1841', party: 'Whig',
    portrait: p('William_Henry_Harrison_daguerreotype_edit.jpg'),
    fact: 'Shortest presidency in history — delivered the longest inaugural address in a storm, then died of pneumonia 31 days later.',
  },
  {
    id: 10, number: '10th', name: 'John Tyler',
    years: '1841–1845', party: 'Whig / Independent',
    portrait: p('John_Tyler.jpg'),
    fact: 'First VP to assume the presidency. Vetoed so many of his own party\'s bills that the Whigs expelled him.',
  },
  {
    id: 11, number: '11th', name: 'James K. Polk',
    years: '1845–1849', party: 'Democratic',
    portrait: p('James_Knox_Polk.jpg'),
    fact: 'Oversaw the largest territorial expansion in US history, adding over 1.2 million square miles including California.',
  },
  {
    id: 12, number: '12th', name: 'Zachary Taylor',
    years: '1849–1850', party: 'Whig',
    portrait: p('Zachary_Taylor_edit.jpg'),
    fact: 'War hero who died just 16 months into office. He had never voted in a presidential election before winning one.',
  },
  {
    id: 13, number: '13th', name: 'Millard Fillmore',
    years: '1850–1853', party: 'Whig',
    portrait: p('Millard_Fillmore.jpg'),
    fact: 'Last Whig president. Signed the Compromise of 1850, which temporarily eased tensions over slavery.',
  },
  {
    id: 14, number: '14th', name: 'Franklin Pierce',
    years: '1853–1857', party: 'Democratic',
    portrait: p('Franklin_Pierce.jpg'),
    fact: 'Only elected president to seek but fail to win his own party\'s renomination for a second term.',
  },
  {
    id: 15, number: '15th', name: 'James Buchanan',
    years: '1857–1861', party: 'Democratic',
    portrait: p('James_Buchanan_-_NARA_-_527674_edit2.jpg'),
    fact: 'The only bachelor president. His inaction as Southern states seceded left Lincoln a nation on the brink of war.',
  },
  {
    id: 16, number: '16th', name: 'Abraham Lincoln',
    years: '1861–1865', party: 'Republican',
    portrait: p('Abraham_Lincoln_O-77_matte_collodion_print.jpg'),
    fact: 'Led the nation through the Civil War and abolished slavery. Assassinated by John Wilkes Booth in 1865.',
  },
  {
    id: 17, number: '17th', name: 'Andrew Johnson',
    years: '1865–1869', party: 'National Union',
    portrait: p('Andrew_Johnson.jpg'),
    fact: 'First president to be impeached, acquitted in the Senate by just one vote.',
  },
  {
    id: 18, number: '18th', name: 'Ulysses S. Grant',
    years: '1869–1877', party: 'Republican',
    portrait: p('Ulysses_Grant_1870-1880.jpg'),
    fact: 'Civil War hero who signed legislation establishing Yellowstone, the world\'s first national park.',
  },
  {
    id: 19, number: '19th', name: 'Rutherford B. Hayes',
    years: '1877–1881', party: 'Republican',
    portrait: p('Rutherford_B._Hayes.jpg'),
    fact: 'First president to use a telephone in the White House. Thomas Edison demonstrated the phonograph to him personally.',
  },
  {
    id: 20, number: '20th', name: 'James A. Garfield',
    years: '1881', party: 'Republican',
    portrait: p('James_Garfield.jpg'),
    fact: 'Assassinated just 200 days into office. He was ambidextrous and could simultaneously write Greek with one hand and Latin with the other.',
  },
  {
    id: 21, number: '21st', name: 'Chester A. Arthur',
    years: '1881–1885', party: 'Republican',
    portrait: p('Chester_A_Arthur.jpg'),
    fact: 'Known for his impeccable fashion sense (reportedly owned 80 pairs of pants). Overhauled the civil service system.',
  },
  {
    id: 22, number: '22nd & 24th', name: 'Grover Cleveland',
    years: '1885–1889, 1893–1897', party: 'Democratic',
    portrait: p('Grover_Cleveland.jpg'),
    fact: 'Only president to serve two non-consecutive terms, making him both the 22nd and 24th president.',
  },
  {
    id: 23, number: '23rd', name: 'Benjamin Harrison',
    years: '1889–1893', party: 'Republican',
    portrait: p('Benjamin_Harrison.jpg'),
    fact: 'Grandson of President William Henry Harrison. The White House was first wired for electricity during his term — he was afraid to touch the switches.',
  },
  {
    id: 24, number: '25th', name: 'William McKinley',
    years: '1897–1901', party: 'Republican',
    portrait: p('William_McKinley.jpg'),
    fact: 'Led the US to victory in the Spanish-American War, acquiring Puerto Rico, Guam, and the Philippines. Assassinated in 1901.',
  },
  {
    id: 25, number: '26th', name: 'Theodore Roosevelt',
    years: '1901–1909', party: 'Republican',
    portrait: p('President_Roosevelt_-_Pach_Bros.jpg'),
    fact: 'Youngest president at 42. Established 150 national forests, 5 national parks, and 18 national monuments. The teddy bear is named after him.',
  },
  {
    id: 26, number: '27th', name: 'William Howard Taft',
    years: '1909–1913', party: 'Republican',
    portrait: p('William_Howard_Taft.jpg'),
    fact: 'The only person to serve as both President and Chief Justice of the Supreme Court.',
  },
  {
    id: 27, number: '28th', name: 'Woodrow Wilson',
    years: '1913–1921', party: 'Democratic',
    portrait: p('Woodrow_Wilson.jpg'),
    fact: 'Led the US through WWI and proposed the League of Nations — the forerunner of the United Nations.',
  },
  {
    id: 28, number: '29th', name: 'Warren G. Harding',
    years: '1921–1923', party: 'Republican',
    portrait: p('Warren_G._Harding.jpg'),
    fact: 'Coined the word "normalcy." His administration was rocked by the Teapot Dome scandal. Died in office.',
  },
  {
    id: 29, number: '30th', name: 'Calvin Coolidge',
    years: '1923–1929', party: 'Republican',
    portrait: p('Calvin_Coolidge.jpg'),
    fact: 'Known as "Silent Cal" for his quiet demeanor. Once vetoed a bill that would have given him a pay raise.',
  },
  {
    id: 30, number: '31st', name: 'Herbert Hoover',
    years: '1929–1933', party: 'Republican',
    portrait: p('Herbert_Hoover.jpg'),
    fact: 'First president born west of the Mississippi. His presidency coincided with the start of the Great Depression.',
  },
  {
    id: 31, number: '32nd', name: 'Franklin D. Roosevelt',
    years: '1933–1945', party: 'Democratic',
    portrait: p('FDR_in_1933.jpg'),
    fact: 'Only president elected four times. Led the US through the Great Depression and WWII despite being paralyzed from the waist down.',
  },
  {
    id: 32, number: '33rd', name: 'Harry S. Truman',
    years: '1945–1953', party: 'Democratic',
    portrait: p('Harry_S_Truman.jpg'),
    fact: 'Made the decision to use atomic bombs on Japan to end WWII. Desegregated the US military by executive order.',
  },
  {
    id: 33, number: '34th', name: 'Dwight D. Eisenhower',
    years: '1953–1961', party: 'Republican',
    portrait: p('Dwight_Eisenhower.jpg'),
    fact: 'Supreme Allied Commander in WWII. Created the Interstate Highway System — originally justified for military evacuation.',
  },
  {
    id: 34, number: '35th', name: 'John F. Kennedy',
    years: '1961–1963', party: 'Democratic',
    portrait: p('John_F._Kennedy_White_House_color_photo_portrait.jpg'),
    fact: 'Youngest elected president at 43. Navigated the Cuban Missile Crisis, bringing the world back from nuclear brinkmanship.',
  },
  {
    id: 35, number: '36th', name: 'Lyndon B. Johnson',
    years: '1963–1969', party: 'Democratic',
    portrait: p('Lyndon_Johnson.jpg'),
    fact: 'Signed the Civil Rights Act of 1964 and the Voting Rights Act of 1965, landmark achievements of the civil rights movement.',
  },
  {
    id: 36, number: '37th', name: 'Richard Nixon',
    years: '1969–1974', party: 'Republican',
    portrait: p('Richard_Nixon.jpg'),
    fact: 'First president to visit China, opening diplomatic relations. First and only president to resign from office.',
  },
  {
    id: 37, number: '38th', name: 'Gerald Ford',
    years: '1974–1977', party: 'Republican',
    portrait: p('Gerald_Ford_presidential_portrait.jpg'),
    fact: 'The only person to become president without being elected as either VP or president. Pardoned Nixon.',
  },
  {
    id: 38, number: '39th', name: 'Jimmy Carter',
    years: '1977–1981', party: 'Democratic',
    portrait: p('Jimmy_Carter.jpg'),
    fact: 'Brokered the Camp David Accords between Israel and Egypt. Awarded the Nobel Peace Prize in 2002.',
  },
  {
    id: 39, number: '40th', name: 'Ronald Reagan',
    years: '1981–1989', party: 'Republican',
    portrait: p('Official_Portrait_of_President_Reagan_1981.jpg'),
    fact: 'Oldest elected president at 69. Presided over the end of the Cold War and the fall of the Berlin Wall.',
  },
  {
    id: 40, number: '41st', name: 'George H. W. Bush',
    years: '1989–1993', party: 'Republican',
    portrait: p('George_H._W._Bush,_President_of_the_United_States,_1989_official_portrait.jpg'),
    fact: 'Led the international coalition that liberated Kuwait in Operation Desert Storm.',
  },
  {
    id: 41, number: '42nd', name: 'Bill Clinton',
    years: '1993–2001', party: 'Democratic',
    portrait: p('Bill_Clinton.jpg'),
    fact: 'First baby-boomer president. Presided over the longest peacetime economic expansion in US history.',
  },
  {
    id: 42, number: '43rd', name: 'George W. Bush',
    years: '2001–2009', party: 'Republican',
    portrait: p('George_W._Bush.jpg'),
    fact: 'Led the US response to 9/11, launching the War on Terror and wars in Afghanistan and Iraq.',
  },
  {
    id: 43, number: '44th', name: 'Barack Obama',
    years: '2009–2017', party: 'Democratic',
    portrait: p('President_Barack_Obama.jpg'),
    fact: 'First African American president. Signed the Affordable Care Act and ordered the raid that killed Osama bin Laden.',
  },
  {
    id: 44, number: '45th & 47th', name: 'Donald Trump',
    years: '2017–2021, 2025–present', party: 'Republican',
    portrait: p('Donald_Trump_official_portrait.jpg'),
    fact: 'First president to be impeached twice. Became the second president (after Cleveland) to win non-consecutive terms.',
  },
  {
    id: 45, number: '46th', name: 'Joe Biden',
    years: '2021–2025', party: 'Democratic',
    portrait: p('Joe_Biden_presidential_portrait.jpg'),
    fact: 'Oldest president in US history, taking office at 78. Withdrew US troops from Afghanistan after 20 years.',
  },
];

// Name lookup for type mode — maps typed strings → president id
export const PRESIDENT_LOOKUP: Record<string, number> = {};
for (const p of PRESIDENTS) {
  PRESIDENT_LOOKUP[p.name.toLowerCase()] = p.id;
}
// Common alternates
Object.assign(PRESIDENT_LOOKUP, {
  'washington':         1,
  'adams':              2,  // defaults to John Adams
  'john adams':         2,
  'jefferson':          3,
  'madison':            4,
  'monroe':             5,
  'john quincy adams':  6,
  'jackson':            7,
  'van buren':          8,
  'harrison':           9,  // defaults to William Henry Harrison
  'william harrison':   9,
  'tyler':              10,
  'polk':               11,
  'james polk':         11,
  'taylor':             12,
  'fillmore':           13,
  'pierce':             14,
  'buchanan':           15,
  'lincoln':            16,
  'johnson':            17, // defaults to Andrew Johnson
  'andrew johnson':     17,
  'grant':              18,
  'hayes':              19,
  'garfield':           20,
  'arthur':             21,
  'cleveland':          22,
  'grover cleveland':   22,
  'benjamin harrison':  23,
  'ben harrison':       23,
  'mckinley':           24,
  'william mckinley':   24,
  'teddy roosevelt':    25,
  'theodore roosevelt': 25,
  'roosevelt':          25, // defaults to Theodore
  'taft':               26,
  'wilson':             27,
  'harding':            28,
  'coolidge':           29,
  'hoover':             30,
  'fdr':                31,
  'franklin roosevelt': 31,
  'truman':             32,
  'eisenhower':         33,
  'ike':                33,
  'jfk':                34,
  'kennedy':            34,
  'lbj':                35,
  'lyndon johnson':     35,
  'nixon':              36,
  'ford':               37,
  'gerald ford':        37,
  'carter':             38,
  'reagan':             39,
  'bush':               40, // defaults to George H.W. Bush
  'george h.w. bush':   40,
  'george hw bush':     40,
  'george bush sr':     40,
  'clinton':            41,
  'bill clinton':       41,
  'george w. bush':     42,
  'george w bush':      42,
  'george bush jr':     42,
  'gwb':                42,
  'obama':              43,
  'trump':              44,
  'donald trump':       44,
  'biden':              45,
  'joe biden':          45,
});

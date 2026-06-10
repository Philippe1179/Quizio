export type CapitalCoord = { lat: number; lng: number; zoom: number; capital: string; noHighlight?: boolean };

export const capitalCoords: Record<string, CapitalCoord> = {
  // Europe — Western
  'France':                   { lat: 48.86,  lng:   2.35,  zoom: 5,    capital: 'Paris' },
  'Germany':                  { lat: 52.52,  lng:  13.41,  zoom: 5,    capital: 'Berlin' },
  'Italy':                    { lat: 41.90,  lng:  12.50,  zoom: 4.5,  capital: 'Rome' },
  'Spain':                    { lat: 40.42,  lng:  -3.71,  zoom: 4.5,  capital: 'Madrid' },
  'Portugal':                 { lat: 38.72,  lng:  -9.14,  zoom: 6,    capital: 'Lisbon' },
  'Netherlands':              { lat: 52.37,  lng:   4.90,  zoom: 7,    capital: 'Amsterdam' },
  'Belgium':                  { lat: 50.85,  lng:   4.35,  zoom: 8,    capital: 'Brussels' },
  'Switzerland':              { lat: 46.95,  lng:   7.45,  zoom: 8,    capital: 'Bern' },
  'Austria':                  { lat: 48.21,  lng:  16.37,  zoom: 7,    capital: 'Vienna' },
  'Ireland':                  { lat: 53.33,  lng:  -6.27,  zoom: 7,    capital: 'Dublin' },
  'United Kingdom':           { lat: 51.51,  lng:  -0.13,  zoom: 5,    capital: 'London' },
  'Luxembourg':               { lat: 49.61,  lng:   6.13,  zoom: 11,   capital: 'Luxembourg City' },

  // Europe — Northern
  'Sweden':                   { lat: 59.33,  lng:  18.07,  zoom: 4,    capital: 'Stockholm' },
  'Norway':                   { lat: 59.91,  lng:  10.75,  zoom: 4,    capital: 'Oslo' },
  'Denmark':                  { lat: 55.68,  lng:  12.57,  zoom: 7,    capital: 'Copenhagen' },
  'Finland':                  { lat: 60.17,  lng:  24.94,  zoom: 4.5,  capital: 'Helsinki' },
  'Iceland':                  { lat: 64.14,  lng: -22.00,  zoom: 5.5,  capital: 'Reykjavik' },

  // Europe — Eastern
  'Poland':                   { lat: 52.23,  lng:  21.01,  zoom: 4.5,  capital: 'Warsaw' },
  'Czechia':                  { lat: 50.09,  lng:  14.42,  zoom: 7,    capital: 'Prague' },
  'Hungary':                  { lat: 47.50,  lng:  19.04,  zoom: 6.5,  capital: 'Budapest' },
  'Romania':                  { lat: 44.44,  lng:  26.10,  zoom: 5,    capital: 'Bucharest' },
  'Bulgaria':                 { lat: 42.70,  lng:  23.32,  zoom: 5.5,  capital: 'Sofia' },
  'Slovakia':                 { lat: 48.15,  lng:  17.11,  zoom: 7.5,  capital: 'Bratislava' },
  'Ukraine':                  { lat: 50.45,  lng:  30.52,  zoom: 4,    capital: 'Kyiv' },
  'Belarus':                  { lat: 53.91,  lng:  27.57,  zoom: 5,    capital: 'Minsk' },
  'Moldova':                  { lat: 47.00,  lng:  28.86,  zoom: 8,    capital: 'Chișinău' },
  'Estonia':                  { lat: 59.44,  lng:  24.74,  zoom: 7.5,  capital: 'Tallinn' },
  'Latvia':                   { lat: 56.95,  lng:  24.11,  zoom: 7,    capital: 'Riga' },
  'Lithuania':                { lat: 54.69,  lng:  25.28,  zoom: 7,    capital: 'Vilnius' },

  // Europe — Southern/Balkans
  'Greece':                   { lat: 37.98,  lng:  23.73,  zoom: 5.5,  capital: 'Athens' },
  'Turkey':                   { lat: 39.93,  lng:  32.85,  zoom: 4,    capital: 'Ankara' },
  'Serbia':                   { lat: 44.80,  lng:  20.47,  zoom: 6.5,  capital: 'Belgrade' },
  'Croatia':                  { lat: 45.81,  lng:  15.98,  zoom: 6,    capital: 'Zagreb' },
  'Albania':                  { lat: 41.33,  lng:  19.82,  zoom: 8,    capital: 'Tirana' },
  'N. Macedonia':             { lat: 42.00,  lng:  21.43,  zoom: 9,    capital: 'Skopje' },
  'Bosnia and Herz.':         { lat: 43.85,  lng:  18.42,  zoom: 7,    capital: 'Sarajevo' },
  'Montenegro':               { lat: 42.44,  lng:  19.26,  zoom: 10,   capital: 'Podgorica' },
  'Slovenia':                 { lat: 46.05,  lng:  14.51,  zoom: 9,    capital: 'Ljubljana' },
  'Cyprus':                   { lat: 35.17,  lng:  33.37,  zoom: 9,    capital: 'Nicosia' },
  'Kosovo':                   { lat: 42.67,  lng:  21.17,  zoom: 11,   capital: 'Pristina' },

  // Europe — Caucasus
  'Georgia':                  { lat: 41.69,  lng:  44.83,  zoom: 7,    capital: 'Tbilisi' },
  'Armenia':                  { lat: 40.18,  lng:  44.51,  zoom: 8,    capital: 'Yerevan' },
  'Azerbaijan':               { lat: 40.41,  lng:  49.87,  zoom: 7.5,  capital: 'Baku' },

  // Russia
  'Russia':                   { lat: 55.75,  lng:  37.62,  zoom: 1.5,  capital: 'Moscow' },

  // Americas — North
  'United States of America': { lat: 38.91,  lng: -77.04,  zoom: 2,    capital: 'Washington, D.C.' },
  'Canada':                   { lat: 45.42,  lng: -75.70,  zoom: 2,    capital: 'Ottawa' },
  'Mexico':                   { lat: 19.43,  lng: -99.13,  zoom: 3,    capital: 'Mexico City' },

  // Americas — Central
  'Guatemala':                { lat: 14.64,  lng: -90.51,  zoom: 6,    capital: 'Guatemala City' },
  'Belize':                   { lat: 17.25,  lng: -88.77,  zoom: 7,    capital: 'Belmopan' },
  'Honduras':                 { lat: 14.10,  lng: -87.21,  zoom: 6.5,  capital: 'Tegucigalpa' },
  'Nicaragua':                { lat: 12.13,  lng: -86.29,  zoom: 6,    capital: 'Managua' },
  'El Salvador':              { lat: 13.70,  lng: -89.22,  zoom: 8,    capital: 'San Salvador' },
  'Panama':                   { lat:  8.99,  lng: -79.52,  zoom: 7,    capital: 'Panama City' },

  // Americas — South
  'Brazil':                   { lat: -15.78, lng: -47.93,  zoom: 2.5,  capital: 'Brasília' },
  'Argentina':                { lat: -34.60, lng: -58.38,  zoom: 2.5,  capital: 'Buenos Aires' },
  'Chile':                    { lat: -33.46, lng: -70.65,  zoom: 2.5,  capital: 'Santiago' },
  'Colombia':                 { lat:  4.71,  lng: -74.08,  zoom: 4,    capital: 'Bogotá' },
  'Peru':                     { lat: -12.05, lng: -77.04,  zoom: 3.5,  capital: 'Lima' },
  'Venezuela':                { lat: 10.48,  lng: -66.86,  zoom: 4,    capital: 'Caracas' },
  'Ecuador':                  { lat: -0.23,  lng: -78.50,  zoom: 5,    capital: 'Quito' },
  'Bolivia':                  { lat: -16.50, lng: -68.13,  zoom: 3.5,  capital: 'La Paz' },
  'Uruguay':                  { lat: -34.90, lng: -56.19,  zoom: 5.5,  capital: 'Montevideo' },
  'Paraguay':                 { lat: -25.29, lng: -57.63,  zoom: 5,    capital: 'Asunción' },
  'Suriname':                 { lat:  5.85,  lng: -55.20,  zoom: 5,    capital: 'Paramaribo' },
  'Guyana':                   { lat:  6.80,  lng: -58.16,  zoom: 5.5,  capital: 'Georgetown' },

  // Middle East
  'Saudi Arabia':             { lat: 24.69,  lng:  46.69,  zoom: 3.5,  capital: 'Riyadh' },
  'Iran':                     { lat: 35.69,  lng:  51.39,  zoom: 3.5,  capital: 'Tehran' },
  'Iraq':                     { lat: 33.34,  lng:  44.37,  zoom: 5,    capital: 'Baghdad' },
  'Jordan':                   { lat: 31.95,  lng:  35.93,  zoom: 6,    capital: 'Amman' },
  'Lebanon':                  { lat: 33.89,  lng:  35.50,  zoom: 9,    capital: 'Beirut' },
  'Qatar':                    { lat: 25.29,  lng:  51.53,  zoom: 9,    capital: 'Doha' },
  'Oman':                     { lat: 23.61,  lng:  58.59,  zoom: 4.5,  capital: 'Muscat' },

  // Asia — Central
  'Kazakhstan':               { lat: 51.18,  lng:  71.43,  zoom: 2.5,  capital: 'Astana' },
  'Uzbekistan':               { lat: 41.30,  lng:  69.24,  zoom: 4.5,  capital: 'Tashkent' },
  'Kyrgyzstan':               { lat: 42.87,  lng:  74.59,  zoom: 5,    capital: 'Bishkek' },
  'Tajikistan':               { lat: 38.56,  lng:  68.77,  zoom: 5.5,  capital: 'Dushanbe' },
  'Turkmenistan':             { lat: 37.95,  lng:  58.37,  zoom: 4.5,  capital: 'Ashgabat' },
  'Afghanistan':              { lat: 34.53,  lng:  69.18,  zoom: 4,    capital: 'Kabul' },
  'Mongolia':                 { lat: 47.91,  lng: 106.92,  zoom: 2.5,  capital: 'Ulaanbaatar' },

  // Asia — South
  'India':                    { lat: 28.61,  lng:  77.21,  zoom: 3,    capital: 'New Delhi' },
  'Pakistan':                 { lat: 33.72,  lng:  73.04,  zoom: 4,    capital: 'Islamabad' },
  'Bangladesh':               { lat: 23.81,  lng:  90.41,  zoom: 6,    capital: 'Dhaka' },
  'Nepal':                    { lat: 27.71,  lng:  85.32,  zoom: 6.5,  capital: 'Kathmandu' },
  'Bhutan':                   { lat: 27.47,  lng:  89.64,  zoom: 8,    capital: 'Thimphu' },

  // Asia — East
  'China':                    { lat: 39.91,  lng: 116.39,  zoom: 2.5,  capital: 'Beijing' },
  'Japan':                    { lat: 35.69,  lng: 139.69,  zoom: 5,    capital: 'Tokyo' },
  'South Korea':              { lat: 37.57,  lng: 126.98,  zoom: 6,    capital: 'Seoul' },

  // Asia — Southeast
  'Vietnam':                  { lat: 21.03,  lng: 105.85,  zoom: 4,    capital: 'Hanoi' },
  'Thailand':                 { lat: 13.75,  lng: 100.50,  zoom: 4,    capital: 'Bangkok' },
  'Malaysia':                 { lat:  3.15,  lng: 101.69,  zoom: 5,    capital: 'Kuala Lumpur' },
  'Philippines':              { lat: 14.60,  lng: 120.98,  zoom: 4.5,  capital: 'Manila' },
  'Myanmar':                  { lat: 19.78,  lng:  96.13,  zoom: 3.5,  capital: 'Naypyidaw' },
  'Cambodia':                 { lat: 11.57,  lng: 104.92,  zoom: 6,    capital: 'Phnom Penh' },
  'Laos':                     { lat: 17.97,  lng: 102.60,  zoom: 5,    capital: 'Vientiane' },
  'Indonesia':                { lat: -6.21,  lng: 106.85,  zoom: 3,    capital: 'Jakarta' },
  'Timor-Leste':              { lat: -8.56,  lng: 125.59,  zoom: 8,    capital: 'Dili' },
  'Brunei':                   { lat:  4.94,  lng: 114.95,  zoom: 10,   capital: 'Bandar Seri Begawan' },

  // Oceania
  'Australia':                { lat: -35.28, lng: 149.13,  zoom: 2,    capital: 'Canberra' },
  'New Zealand':              { lat: -41.29, lng: 174.78,  zoom: 4.5,  capital: 'Wellington' },
  'Papua New Guinea':         { lat: -9.44,  lng: 147.19,  zoom: 3.5,  capital: 'Port Moresby' },
  'Fiji':                     { lat: -18.14, lng: 178.44,  zoom: 7.5,  capital: 'Suva' },
  'Vanuatu':                  { lat: -17.74, lng: 168.32,  zoom: 7,    capital: 'Port Vila' },

  // Africa — North
  'Egypt':                    { lat: 30.06,  lng:  31.25,  zoom: 3.5,  capital: 'Cairo' },
  'Morocco':                  { lat: 34.02,  lng:  -6.85,  zoom: 4.5,  capital: 'Rabat' },
  'Algeria':                  { lat: 36.76,  lng:   3.06,  zoom: 3,    capital: 'Algiers' },
  'Tunisia':                  { lat: 36.82,  lng:  10.18,  zoom: 6,    capital: 'Tunis' },

  // Africa — West
  'Nigeria':                  { lat:  9.06,  lng:   7.49,  zoom: 4,    capital: 'Abuja' },
  'Ghana':                    { lat:  5.56,  lng:  -0.20,  zoom: 6,    capital: 'Accra' },
  'Senegal':                  { lat: 14.72,  lng: -17.45,  zoom: 5.5,  capital: 'Dakar' },
  'Cameroon':                 { lat:  3.87,  lng:  11.52,  zoom: 4.5,  capital: 'Yaoundé' },
  'Niger':                    { lat: 13.51,  lng:   2.12,  zoom: 3.5,  capital: 'Niamey' },
  'Mali':                     { lat: 12.65,  lng:  -8.00,  zoom: 3.5,  capital: 'Bamako' },
  'Mauritania':               { lat: 18.08,  lng: -15.98,  zoom: 3.5,  capital: 'Nouakchott' },
  'Chad':                     { lat: 12.11,  lng:  15.05,  zoom: 3.5,  capital: "N'Djamena" },
  'Gabon':                    { lat:  0.39,  lng:   9.45,  zoom: 6,    capital: 'Libreville' },
  'Congo':                    { lat: -4.27,  lng:  15.28,  zoom: 5.5,  capital: 'Brazzaville' },
  'Central African Rep.':     { lat:  4.36,  lng:  18.56,  zoom: 4.5,  capital: 'Bangui' },

  // Africa — East
  'Ethiopia':                 { lat:  9.02,  lng:  38.74,  zoom: 4,    capital: 'Addis Ababa' },
  'Kenya':                    { lat: -1.29,  lng:  36.82,  zoom: 4.5,  capital: 'Nairobi' },
  'Tanzania':                 { lat: -6.17,  lng:  35.74,  zoom: 3.5,  capital: 'Dodoma' },
  'Rwanda':                   { lat: -1.94,  lng:  30.06,  zoom: 8.5,  capital: 'Kigali' },
  'Burundi':                  { lat: -3.43,  lng:  29.93,  zoom: 8.5,  capital: 'Gitega' },
  'Djibouti':                 { lat: 11.59,  lng:  43.15,  zoom: 9,    capital: 'Djibouti City' },
  'Eritrea':                  { lat: 15.34,  lng:  38.93,  zoom: 6,    capital: 'Asmara' },

  // Small island nations — in 50m dataset
  'Malta':                    { lat: 35.90,  lng:  14.51,  zoom: 10,  capital: 'Valletta' },
  'Samoa':                    { lat: -13.82, lng: -171.78, zoom: 8,   capital: 'Apia' },
  'Tonga':                    { lat: -21.14, lng: -175.22, zoom: 8,   capital: "Nukuʻalofa" },
  'Kiribati':                 { lat:  1.33,  lng: 173.02,  zoom: 7,   capital: 'South Tarawa' },
  'Palau':                    { lat:  7.50,  lng: 134.62,  zoom: 8,   capital: 'Ngerulmud' },
  'Maldives':                 { lat:  4.18,  lng:  73.51,  zoom: 9,   capital: 'Malé' },
  'Micronesia':               { lat:  6.92,  lng: 158.19,  zoom: 7,   capital: 'Palikir' },
  'São Tomé and Principe':    { lat:  0.34,  lng:   6.73,  zoom: 9,   capital: 'São Tomé' },
  'Comoros':                  { lat: -11.70, lng:  43.26,  zoom: 8,   capital: 'Moroni' },
  'Vatican':                  { lat: 41.90,  lng:  12.45,  zoom: 12,  capital: 'Vatican City' },

  // Micro-nations — not in 50m dataset, show Pacific location context
  'Tuvalu':                   { lat: -8.52,  lng: 179.20,  zoom: 5,   capital: 'Funafuti',     noHighlight: true },
  'Nauru':                    { lat: -0.53,  lng: 166.93,  zoom: 5,   capital: 'Yaren',         noHighlight: true },
  'Marshall Islands':         { lat:  7.12,  lng: 171.18,  zoom: 5,   capital: 'Majuro',        noHighlight: true },

  // Africa — Southern
  'South Africa':             { lat: -25.75, lng:  28.19,  zoom: 3.5,  capital: 'Pretoria' },
  'Mozambique':               { lat: -25.97, lng:  32.59,  zoom: 3.5,  capital: 'Maputo' },
  'Zambia':                   { lat: -15.42, lng:  28.28,  zoom: 4,    capital: 'Lusaka' },
  'Zimbabwe':                 { lat: -17.83, lng:  31.05,  zoom: 4.5,  capital: 'Harare' },
  'Namibia':                  { lat: -22.56, lng:  17.08,  zoom: 3,    capital: 'Windhoek' },
  'Botswana':                 { lat: -24.65, lng:  25.91,  zoom: 4,    capital: 'Gaborone' },
  'Malawi':                   { lat: -13.98, lng:  33.79,  zoom: 5,    capital: 'Lilongwe' },
  'Lesotho':                  { lat: -29.32, lng:  27.48,  zoom: 9,    capital: 'Maseru' },
  'Swaziland':                { lat: -26.32, lng:  31.14,  zoom: 11,   capital: 'Mbabane' },
};

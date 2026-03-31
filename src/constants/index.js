export const TIPOS = ["Ácaros","Anélidos","Bacterias","Crustáceos","Fitoplasmas","Hongos y/ó Pseudohongos","Insectos","Especie Vegetal","Miriápodos","Moluscos","Nemátodos","Protista","Vertebrados","Virus ó viroides"];

export const IMPACT_CATS = [
  {key:"restricciones_cuarentenarias", label:"Restricciones cuarentenarias"},
  {key:"perdidas_produccion",          label:"Pérdidas de producción"},
  {key:"mercados_afectados",           label:"Mercados exportación afectados"},
  {key:"costo_control",               label:"Costo de control / manejo"},
  {key:"impacto_exportaciones",        label:"Impacto exportaciones ARG"},
];

export const P = {
  navy:"#0c3060", navy2:"#0a2550", navy3:"#07193a",
  blue:"#185fa5", blue2:"#1472c4", blueL:"#e6f1fb", blueLL:"#f0f6fd",
  accent:"#1d9e75", accentL:"#e1f5ee",
  gold:"#c8900a", goldL:"#fef3dc",
  red:"#a32d2d", redL:"#fcebeb",
  bg:"#f4f7fc", bgW:"#ffffff",
  border:"#ccdaec", border2:"#b0c6e0",
  txt:"#0d1e30", txt2:"#3a5070", txt3:"#7090b0",
  badge:"#e6f1fb",
};

// ── ISO numeric → ISO2 (para TopoJSON world-atlas) ────────────────────────────
export const NUM2 = {
  4:"AF",8:"AL",12:"DZ",24:"AO",32:"AR",36:"AU",40:"AT",50:"BD",56:"BE",
  68:"BO",76:"BR",100:"BG",116:"KH",120:"CM",124:"CA",144:"LK",152:"CL",
  156:"CN",170:"CO",178:"CG",180:"CD",188:"CR",191:"HR",192:"CU",208:"DK",
  214:"DO",218:"EC",818:"EG",231:"ET",246:"FI",250:"FR",276:"DE",288:"GH",
  300:"GR",320:"GT",340:"HN",348:"HU",356:"IN",360:"ID",364:"IR",368:"IQ",
  372:"IE",376:"IL",380:"IT",388:"JM",400:"JO",398:"KZ",404:"KE",408:"KP",
  410:"KR",422:"LB",428:"LV",440:"LT",484:"MX",458:"MY",504:"MA",508:"MZ",
  516:"NA",524:"NP",528:"NL",554:"NZ",566:"NG",578:"NO",586:"PK",591:"PA",
  600:"PY",604:"PE",608:"PH",616:"PL",620:"PT",642:"RO",643:"RU",646:"RW",
  682:"SA",686:"SN",703:"SK",710:"ZA",724:"ES",752:"SE",756:"CH",760:"SY",
  764:"TH",788:"TN",792:"TR",800:"UG",804:"UA",826:"GB",840:"US",858:"UY",
  860:"UZ",862:"VE",704:"VN",887:"YE",716:"ZW",894:"ZM",788:"TN",
};

// Centroides: lat/lon geográficos reales (proyectados en WorldMap con equirectangular)
export const CTRD = {
  AF:{n:"Afganistán",lat:33.9,lon:67.7},AL:{n:"Albania",lat:41.2,lon:20.2},DZ:{n:"Argelia",lat:28.0,lon:3.0},
  AO:{n:"Angola",lat:-11.2,lon:17.9},AR:{n:"Argentina",lat:-38.4,lon:-63.6,arg:true},AU:{n:"Australia",lat:-25.3,lon:133.8},
  AT:{n:"Austria",lat:47.5,lon:14.6},BD:{n:"Bangladesh",lat:23.7,lon:90.4},BE:{n:"Bélgica",lat:50.5,lon:4.5},
  BO:{n:"Bolivia",lat:-16.7,lon:-64.7},BR:{n:"Brasil",lat:-10.8,lon:-51.9},BG:{n:"Bulgaria",lat:42.8,lon:25.5},
  KH:{n:"Camboya",lat:12.6,lon:104.9},CM:{n:"Camerún",lat:5.7,lon:12.4},CA:{n:"Canadá",lat:60.0,lon:-96.5},
  LK:{n:"Sri Lanka",lat:7.9,lon:80.7},CL:{n:"Chile",lat:-35.7,lon:-71.0},CN:{n:"China",lat:35.9,lon:104.2},
  CO:{n:"Colombia",lat:4.1,lon:-74.1},CG:{n:"Rep. Congo",lat:-1.0,lon:15.2},CD:{n:"R.D. Congo",lat:-2.9,lon:23.7},
  CR:{n:"Costa Rica",lat:10.0,lon:-84.0},HR:{n:"Croacia",lat:45.2,lon:16.4},CU:{n:"Cuba",lat:21.8,lon:-79.5},
  DK:{n:"Dinamarca",lat:56.0,lon:10.0},DO:{n:"Rep. Dominicana",lat:18.7,lon:-70.2},
  EC:{n:"Ecuador",lat:-1.8,lon:-78.2},EG:{n:"Egipto",lat:26.0,lon:30.8},ET:{n:"Etiopía",lat:9.1,lon:40.5},
  FI:{n:"Finlandia",lat:63.0,lon:26.9},FR:{n:"Francia",lat:46.6,lon:2.4},DE:{n:"Alemania",lat:51.2,lon:10.5},
  GH:{n:"Ghana",lat:7.9,lon:-1.0},GR:{n:"Grecia",lat:39.0,lon:22.0},GT:{n:"Guatemala",lat:15.5,lon:-90.2},
  HN:{n:"Honduras",lat:15.2,lon:-86.6},HU:{n:"Hungría",lat:47.2,lon:19.5},IN:{n:"India",lat:20.6,lon:78.7},
  ID:{n:"Indonesia",lat:-0.8,lon:113.9},IR:{n:"Irán",lat:32.4,lon:53.7},IQ:{n:"Irak",lat:33.2,lon:43.7},
  IE:{n:"Irlanda",lat:53.2,lon:-8.1},IL:{n:"Israel",lat:31.0,lon:34.9},IT:{n:"Italia",lat:42.5,lon:12.6},
  JM:{n:"Jamaica",lat:18.1,lon:-77.3},JP:{n:"Japón",lat:37.0,lon:138.0},JO:{n:"Jordania",lat:31.2,lon:37.2},
  KZ:{n:"Kazajistán",lat:48.0,lon:66.9},KE:{n:"Kenia",lat:0.0,lon:37.9},KP:{n:"Corea del Norte",lat:40.3,lon:127.5},
  KR:{n:"Corea del Sur",lat:36.5,lon:127.9},LB:{n:"Líbano",lat:33.9,lon:35.9},LV:{n:"Letonia",lat:56.9,lon:25.0},
  LT:{n:"Lituania",lat:56.0,lon:24.0},MG:{n:"Madagascar",lat:-19.4,lon:46.9},MY:{n:"Malasia",lat:4.2,lon:109.7},
  MX:{n:"México",lat:24.0,lon:-102.6},MA:{n:"Marruecos",lat:31.8,lon:-6.3},MZ:{n:"Mozambique",lat:-18.7,lon:35.5},
  NA:{n:"Namibia",lat:-22.0,lon:18.5},NP:{n:"Nepal",lat:28.4,lon:84.1},NL:{n:"Países Bajos",lat:52.4,lon:5.3},
  NZ:{n:"Nueva Zelanda",lat:-40.9,lon:171.5},NG:{n:"Nigeria",lat:9.1,lon:8.7},NO:{n:"Noruega",lat:64.0,lon:13.0},
  PK:{n:"Pakistán",lat:30.4,lon:69.3},PA:{n:"Panamá",lat:8.6,lon:-80.0},PY:{n:"Paraguay",lat:-23.5,lon:-58.3},
  PE:{n:"Perú",lat:-9.2,lon:-75.0},PH:{n:"Filipinas",lat:12.9,lon:122.9},PL:{n:"Polonia",lat:52.0,lon:20.0},
  PT:{n:"Portugal",lat:39.6,lon:-8.2},RO:{n:"Rumania",lat:45.9,lon:24.7},RU:{n:"Rusia",lat:61.0,lon:99.8},
  RW:{n:"Ruanda",lat:-1.9,lon:29.9},SA:{n:"Arabia Saudita",lat:24.0,lon:45.1},SN:{n:"Senegal",lat:14.5,lon:-14.5},
  SK:{n:"Eslovaquia",lat:48.7,lon:19.5},ZA:{n:"Sudáfrica",lat:-29.0,lon:25.0},ES:{n:"España",lat:40.2,lon:-3.7},
  SE:{n:"Suecia",lat:62.8,lon:17.2},CH:{n:"Suiza",lat:46.8,lon:8.2},SY:{n:"Siria",lat:35.0,lon:38.5},
  TH:{n:"Tailandia",lat:15.0,lon:100.9},TN:{n:"Túnez",lat:33.9,lon:9.6},TR:{n:"Turquía",lat:39.0,lon:35.2},
  UG:{n:"Uganda",lat:1.4,lon:32.3},UA:{n:"Ucrania",lat:49.0,lon:32.0},GB:{n:"Reino Unido",lat:54.0,lon:-2.9},
  US:{n:"Estados Unidos",lat:38.0,lon:-98.4},UY:{n:"Uruguay",lat:-33.0,lon:-56.0},UZ:{n:"Uzbekistán",lat:41.4,lon:63.0},
  VE:{n:"Venezuela",lat:8.0,lon:-66.6},VN:{n:"Vietnam",lat:16.5,lon:107.8},YE:{n:"Yemen",lat:16.0,lon:48.5},
  ZW:{n:"Zimbabwe",lat:-20.0,lon:30.0},ZM:{n:"Zambia",lat:-13.5,lon:27.8},
  CI:{n:"Costa de Marfil",lat:7.5,lon:-5.5},TZ:{n:"Tanzania",lat:-6.3,lon:34.9},
  BY:{n:"Bielorrusia",lat:53.7,lon:28.0},GE:{n:"Georgia",lat:42.0,lon:43.4},AZ:{n:"Azerbaiyán",lat:40.5,lon:47.6},
};

export const MAP_COLORS = {
  presente:      {fill:"#1472c4", stroke:"#083a7a", label:"Presente"},
  cuarentena:    {fill:"#c0282a", stroke:"#7a0a0a", label:"Cuarentena / Interceptada"},
  ausente_riesgo:{fill:"#d08a00", stroke:"#7a4e00", label:"Riesgo de ingreso"},
  erradicada:    {fill:"#6050a0", stroke:"#3a2a70", label:"Erradicada"},
};

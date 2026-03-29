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

// Centroides (x=lon+180)/360*1000, y=(90-lat)/180*507)
export const CTRD = {
  AF:{n:"Afganistán",x:544,y:179},AL:{n:"Albania",x:466,y:164},DZ:{n:"Argelia",x:447,y:191},
  AO:{n:"Angola",x:474,y:286},AR:{n:"Argentina",x:174,y:373,arg:true},AU:{n:"Australia",x:671,y:320},
  AT:{n:"Austria",x:467,y:153},BD:{n:"Bangladesh",x:576,y:212},BE:{n:"Bélgica",x:454,y:144},
  BO:{n:"Bolivia",x:177,y:333},BR:{n:"Brasil",x:223,y:319},BG:{n:"Bulgaria",x:474,y:159},
  KH:{n:"Camboya",x:607,y:233},CM:{n:"Camerún",x:457,y:253},CA:{n:"Canadá",x:196,y:94},
  LK:{n:"Sri Lanka",x:567,y:240},CL:{n:"Chile",x:156,y:362},CN:{n:"China",x:610,y:176},
  CO:{n:"Colombia",x:159,y:275},CG:{n:"Rep. Congo",x:465,y:265},CD:{n:"R.D. Congo",x:478,y:270},
  CR:{n:"Costa Rica",x:151,y:251},HR:{n:"Croacia",x:462,y:156},CU:{n:"Cuba",x:192,y:223},
  DK:{n:"Dinamarca",x:457,y:131},DO:{n:"Rep. Dominicana",x:207,y:231},
  EC:{n:"Ecuador",x:144,y:289},EG:{n:"Egipto",x:487,y:193},ET:{n:"Etiopía",x:500,y:241},
  FI:{n:"Finlandia",x:472,y:106},FR:{n:"Francia",x:449,y:160},DE:{n:"Alemania",x:464,y:144},
  GH:{n:"Ghana",x:437,y:249},GR:{n:"Grecia",x:471,y:173},GT:{n:"Guatemala",x:150,y:237},
  HN:{n:"Honduras",x:157,y:241},HU:{n:"Hungría",x:471,y:151},IN:{n:"India",x:562,y:216},
  ID:{n:"Indonesia",x:622,y:269},IR:{n:"Irán",x:534,y:187},IQ:{n:"Irak",x:517,y:183},
  IE:{n:"Irlanda",x:434,y:130},IL:{n:"Israel",x:501,y:183},IT:{n:"Italia",x:464,y:170},
  JM:{n:"Jamaica",x:194,y:235},JP:{n:"Japón",x:664,y:166},JO:{n:"Jordania",x:503,y:186},
  KZ:{n:"Kazajistán",x:547,y:139},KE:{n:"Kenia",x:504,y:261},KP:{n:"Corea del Norte",x:650,y:163},
  KR:{n:"Corea del Sur",x:654,y:171},LB:{n:"Líbano",x:501,y:176},LV:{n:"Letonia",x:474,y:126},
  LT:{n:"Lituania",x:474,y:131},MG:{n:"Madagascar",x:514,y:290},MY:{n:"Malasia",x:607,y:253},
  MX:{n:"México",x:158,y:213},MA:{n:"Marruecos",x:427,y:186},MZ:{n:"Mozambique",x:500,y:296},
  NA:{n:"Namibia",x:474,y:306},NP:{n:"Nepal",x:565,y:199},NL:{n:"Países Bajos",x:457,y:139},
  NZ:{n:"Nueva Zelanda",x:714,y:354},NG:{n:"Nigeria",x:450,y:243},NO:{n:"Noruega",x:451,y:109},
  PK:{n:"Pakistán",x:550,y:189},PA:{n:"Panamá",x:159,y:255},PY:{n:"Paraguay",x:187,y:344},
  PE:{n:"Perú",x:149,y:312},PH:{n:"Filipinas",x:634,y:229},PL:{n:"Polonia",x:472,y:138},
  PT:{n:"Portugal",x:421,y:170},RO:{n:"Rumania",x:477,y:153},RU:{n:"Rusia",x:562,y:109},
  RW:{n:"Ruanda",x:493,y:264},SA:{n:"Arabia Saudita",x:518,y:210},SN:{n:"Senegal",x:417,y:236},
  SK:{n:"Eslovaquia",x:469,y:145},ZA:{n:"Sudáfrica",x:484,y:320},ES:{n:"España",x:434,y:170},
  SE:{n:"Suecia",x:461,y:112},CH:{n:"Suiza",x:457,y:156},SY:{n:"Siria",x:505,y:176},
  TH:{n:"Tailandia",x:600,y:229},TN:{n:"Túnez",x:455,y:183},TR:{n:"Turquía",x:494,y:163},
  UG:{n:"Uganda",x:496,y:259},UA:{n:"Ucrania",x:485,y:144},GB:{n:"Reino Unido",x:441,y:133},
  US:{n:"Estados Unidos",x:198,y:155},UY:{n:"Uruguay",x:194,y:359},UZ:{n:"Uzbekistán",x:546,y:156},
  VE:{n:"Venezuela",x:177,y:269},VN:{n:"Vietnam",x:610,y:224},YE:{n:"Yemen",x:518,y:229},
  ZW:{n:"Zimbabwe",x:492,y:297},ZM:{n:"Zambia",x:490,y:286},
  CI:{n:"Costa de Marfil",x:429,y:253},TZ:{n:"Tanzania",x:500,y:276},
  BY:{n:"Bielorrusia",x:478,y:136},GE:{n:"Georgia",x:513,y:159},AZ:{n:"Azerbaiyán",x:520,y:163},
};

export const MAP_COLORS = {
  presente:      {fill:"#1472c4", stroke:"#083a7a", label:"Presente"},
  cuarentena:    {fill:"#c0282a", stroke:"#7a0a0a", label:"Cuarentena / Interceptada"},
  ausente_riesgo:{fill:"#d08a00", stroke:"#7a4e00", label:"Riesgo de ingreso"},
  erradicada:    {fill:"#6050a0", stroke:"#3a2a70", label:"Erradicada"},
};

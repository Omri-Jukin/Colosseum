export const journeyStops = [
  {
    id: 'exterior',
    kind: 'hero',
    numeral: 'I',
    kicker: 'Outer Rome · Establishing view',
    datum: '80 CE',
    title: 'The arena enters history',
    copy:
      'Titus completed and dedicated the Flavian Amphitheatre in 80 CE. Its modern name came from the colossal statue that once stood nearby.',
    source: {
      label: 'The Metropolitan Museum of Art',
      url: 'https://www.metmuseum.org/essays/the-flavian-dynasty-69-96',
    },
  },
  {
    id: 'survival',
    kind: 'fact',
    numeral: 'II',
    kicker: 'Lower ambulatory · The structure',
    datum: '≈ 1,946 years',
    title: 'Not untouched. Still standing.',
    copy:
      'Its endurance is a layered achievement: travertine, tuff, brick and mortar, followed by repeated repairs and modern conservation. The ruin survived change—not the absence of it.',
    source: {
      label: 'Parco archeologico del Colosseo',
      url: 'https://colosseo.it/en/restauri/colosseum/',
    },
  },
  {
    id: 'routing',
    kind: 'fact',
    numeral: 'III',
    kicker: 'Ambulatory · Crowd movement',
    datum: '76',
    title: 'A city-scale wayfinding system',
    copy:
      'Most spectators entered free through 76 numbered arches, then followed marked routes that matched their admission tesserae. The circulation system moved huge crowds without one grand entrance.',
    source: {
      label: 'Parco · The Cavea and Belvedere',
      url: 'https://colosseo.it/en/marvels/the-cavea-of-the-colosseum-and-the-belvedere-terrace/',
    },
  },
  {
    id: 'hierarchy',
    kind: 'fact',
    numeral: 'IV',
    kicker: 'Inner ring · The cavea',
    datum: 'SOCIAL ORDER',
    title: 'Every seat declared a rank',
    copy:
      'Senators sat closest to the arena, equites behind them, and lower-status groups progressively higher. Architecture made Rome’s social hierarchy visible.',
    source: {
      label: 'Parco · The Cavea and Belvedere',
      url: 'https://colosseo.it/en/marvels/the-cavea-of-the-colosseum-and-the-belvedere-terrace/',
    },
  },
  {
    id: 'spectacles',
    kind: 'fact',
    numeral: 'V',
    kicker: 'Arena edge · Public spectacle',
    datum: 'MORE THAN DUELS',
    title: 'Gladiators were only part of the program',
    copy:
      'The amphitheatre hosted gladiatorial contests and animal hunts, supported by a wider production system of performers, handlers, equipment and stagecraft.',
    source: {
      label: 'Parco · The Colosseum',
      url: 'https://colosseo.it/en/area/the-colosseum/',
    },
  },
  {
    id: 'hypogeum',
    kind: 'fact',
    numeral: 'VI',
    kicker: 'Arena perimeter · Below the floor',
    datum: '14 CORRIDORS',
    title: 'The spectacle had a backstage',
    copy:
      'Trapdoors, freight lifts, winches and pulleys brought people and animals into view. The first underground works were timber; Domitian later rebuilt the system in masonry.',
    source: {
      label: 'Parco · Underground levels',
      url: 'https://colosseo.it/en/marvels/the-underground-levels-of-the-colosseum/',
    },
  },
  {
    id: 'ruin',
    kind: 'fact',
    numeral: 'VII',
    kicker: 'Southern circuit · Loss and reuse',
    datum: '33 OF 80',
    title: 'What stands is also what was spared',
    copy:
      'The earthquake of 847 contributed to damage and later collapse on the southern side. Today, 33 of the original 80 external arcades survive on the northern side.',
    source: {
      label: 'Parco · Life in the Middle Ages',
      url: 'https://colosseo.it/en/opere/life-in-the-colosseum-in-the-middle-ages-1-domus-and-cryptae/',
    },
  },
  {
    id: 'stewardship',
    kind: 'fact',
    numeral: 'VIII',
    kicker: 'Final circuit · Care in the present',
    datum: '3D SURVEY · 2024',
    title: 'Survival is an active verb',
    copy:
      'The monument is continuously inspected and maintained. Since 2024, a complete 3D survey and heritage building model have supported conservation decisions.',
    source: {
      label: 'Parco · Conservation program',
      url: 'https://colosseo.it/en/restauri/colosseum/',
    },
  },
  {
    id: 'tickets',
    kind: 'station',
    numeral: 'IX',
    kicker: 'Exterior pavilion · Your visit',
    datum: 'THE FINAL STOP',
    title: 'Choose your way in',
    copy:
      'Follow the illuminated path beyond the ancient outer ring to the contemporary visitor pavilion, then select an access route and entry time.',
    source: null,
  },
] as const

export type JourneyStop = (typeof journeyStops)[number]

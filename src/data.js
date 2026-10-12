// All portfolio content lives here. Edit this file to update the site.

export const profile = {
  name: 'Manish Bishwokarma',
  title: 'AI & Software Developer',
  tagline:
    'MSc AI Technology student at Northumbria University London. I build AI, Web3 and data-driven applications, and I am especially interested in FinTech.',
  location: 'London, UK',
  email: 'bkmanish46@gmail.com',
  phone: null, // e.g. '+44 ...' to show a phone number on the Contact section
  github: 'https://github.com/sailenceresw',
  linkedin: 'https://uk.linkedin.com/in/manish-bishwokarma',
  cv: null, // e.g. 'Manish-Bishwokarma-CV.pdf' after placing the PDF in /public
}

// Sections and the room object that opens each one
export const sections = [
  { id: 'projects', label: 'Projects', object: 'the curved monitor' },
  { id: 'about', label: 'About', object: 'the bookshelf' },
  { id: 'skills', label: 'Skills', object: 'the holo-board' },
  { id: 'contact', label: 'Contact', object: 'the neon sign' },
]

export const about = [
  'I am a Computer Science graduate from Teesside University, now studying for an MSc in AI Technology at Northumbria University London.',
  'I like turning ideas into working software: an AI video editor, an anonymous reporting app anchored on the blockchain, and an autonomous trading agent built with LangGraph. I care about privacy, sound architecture and tested code.',
  'I am looking for graduate and junior roles in AI, software engineering and FinTech.',
]

export const education = [
  {
    degree: 'MSc AI Technology',
    school: 'Northumbria University London',
    period: 'In progress',
    detail: 'Postgraduate study in artificial intelligence and its applications.',
  },
  {
    degree: 'BSc (Hons) Computer Science',
    school: 'Teesside University, Middlesbrough',
    period: '2022 – 2024',
    detail:
      'Artificial Intelligence, Machine Learning, Relational & NoSQL Databases, Cloud Computing (Azure), Web Applications & Services, Agile Development, Software Design Patterns, IoT.',
  },
  {
    degree: 'International Year One in Computing',
    school: 'Teesside University International Study Centre',
    period: '2021 – 2022',
    detail: 'Foundation year in computing.',
  },
]

export const languages = ['English (fluent)', 'Nepali (native)', 'Hindi (fluent)']

export const projects = [
  {
    name: 'Khabardar',
    kind: 'Web3 · Privacy',
    year: '2026',
    summary:
      'Anonymous anti-corruption reporting app. Reports and evidence are encrypted and a tamper-proof fingerprint is anchored on the Linea blockchain. Users need no crypto, and no name, phone or email is collected.',
    tags: ['TypeScript', 'React Native', 'Expo', 'Linea', 'Encryption'],
    repo: 'https://github.com/sailenceresw/khabardar',
    featured: true,
  },
  {
    name: 'Feeling Frame',
    kind: 'AI · Video / VFX',
    year: '2024',
    summary:
      'Cross-platform AI video editor. It features auto captions from speech transcription, on-device stabilisation and noise reduction, green-screen chroma key, scene-detected highlights, filters, text and sticker overlays, and 4K-to-1080p export.',
    tags: ['Flutter', 'Dart', 'FFmpeg', 'ML Kit', 'Google Cloud Video AI'],
    repo: 'https://github.com/sailenceresw/Feeling_Frame',
    featured: true,
  },
  {
    name: 'AgentMaya',
    kind: 'AI agent · FinTech',
    year: '2026',
    summary:
      'Autonomous trading agent for crypto perpetual futures, built as a 7-layer LangGraph pipeline: data ingestion, order-flow signals, strategy, hard-coded risk management and execution. It runs in a simulation mode that places no real orders.',
    tags: ['Python', 'LangGraph', 'ccxt', 'pytest'],
    repo: 'https://github.com/sailenceresw/AgentMaya',
    featured: true,
  },
  {
    name: 'Pizza & Co',
    kind: 'Web · UX',
    year: '2026',
    summary:
      'Takeaway ordering website designed around Garrett’s five planes of UX. It has a menu builder, cart, accounts and an admin dashboard, and all artwork is original SVG and CSS animation.',
    tags: ['PHP', 'SQLite', 'JavaScript', 'CSS'],
    repo: 'https://github.com/sailenceresw/Pizza-and-co',
  },
  {
    name: 'ThreeAmigos',
    kind: 'Full-stack e-commerce',
    year: '2024',
    summary:
      'Electronics store built with ASP.NET Core MVC on a 3-tier architecture with repositories, dependency injection and SOLID principles. Features Identity authentication with email verification and password recovery, live search suggestions, category and price filters, a cart with shipment history, and an admin dashboard.',
    tags: ['C#', 'ASP.NET Core MVC', 'EF Core', 'SQL Server', 'jQuery'],
    repo: 'https://github.com/sailenceresw/ThreeAmigos',
  },
  {
    name: '3D Zombie Game',
    kind: 'Game · 3D',
    year: '2022',
    summary: 'Unity game with 3D gameplay mechanics and immersive environments.',
    tags: ['Unity', 'C#'],
  },
  {
    name: 'Olympic Data Analytics',
    kind: 'Data',
    year: '2023',
    summary:
      'Designed and queried a database covering 120 years of Olympic history, with complex T-SQL for analysis and performance.',
    tags: ['SQL Server', 'T-SQL'],
  },
  {
    name: 'Event Management App',
    kind: 'Full-stack web',
    year: '2023',
    summary: 'Web application for managing events, staff allocation and guest services.',
    tags: ['C#', 'ASP.NET', 'EF Core', 'SQL'],
  },
  {
    name: 'IoT Gas Detection',
    kind: 'IoT',
    year: '2022',
    summary: 'Real-time gas monitoring system that detects hazardous leaks using sensors.',
    tags: ['Sensors', 'Embedded'],
  },
]

export const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'C#', 'Java', 'Dart', 'PHP', 'SQL'] },
  { group: 'AI & ML', items: ['LangGraph agents', 'ML fundamentals', 'ML Kit', 'Cloud Video AI'] },
  { group: 'Web & Mobile', items: ['React Native / Expo', 'Flutter', 'ASP.NET Core', 'EF Core'] },
  { group: 'Data', items: ['SQL Server / T-SQL', 'MongoDB', 'SQLite', 'Database design'] },
  { group: 'Cloud & Web3', items: ['Microsoft Azure', 'Linea / EVM'] },
  { group: 'Tools', items: ['Git & GitHub Actions', 'FFmpeg', 'Unity', 'pytest'] },
]

export const experience = [
  {
    role: 'Warehouse Operative',
    org: 'Savers Health & Beauty (via Job & Talent)',
    period: '2026 – present',
    points: ['High-volume picking, packing and stock movement', 'Meeting accuracy and dispatch targets as a team'],
  },
  {
    role: 'Warehouse Associate',
    org: 'Amazon',
    period: '2024 – 2025',
    points: ['Fast-paced, target-driven logistics environment', 'Time management and process optimisation'],
  },
  {
    role: 'Sous Chef',
    org: 'Bianco Restaurant',
    period: '2024',
    points: ['Coordinating and multitasking under pressure'],
  },
]

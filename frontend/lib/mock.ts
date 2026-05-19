// Legacy mock data — types defined locally to avoid coupling with the API types

type User = {
  id: string;
  fullName: string;
  email: string;
  cadetId: string;
  role: "admin" | "competidor" | "instructor" | "moderador";
  avatarColor: string;
  status: "active" | "blocked";
  points: number;
  resolvedChallenges: number;
  rank: number;
  joinedAt: string;
};

type Team = {
  id: string;
  name: string;
  emblem: string;
  motto: string;
  leaderId: string;
  members: string[];
  points: number;
  resolved: number;
  createdAt: string;
};

type ChallengeCategory = "Web" | "Crypto" | "Pwn" | "Forense" | "OSINT" | "Reverse";
type ChallengeDifficulty = "Principiante" | "Intermedio" | "Avanzado";

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  solves: number;
  hidden: boolean;
  resources: { name: string; sizeKb: number; format: string }[];
  hints: { id: string; cost: number; preview: string; locked: boolean }[];
  flagFormat: string;
  rating: number;
};

type LearningModule = {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  level: ChallengeDifficulty;
  lessons: { id: string; title: string; durationMin: number; completed: boolean }[];
  progress: number;
};

type LabEnvironment = {
  challengeId: string;
  status: "stopped" | "running" | "starting" | "error";
  uptimeSec: number;
  remainingSec: number;
  cpuPct: number;
  ramMb: number;
  ramMaxMb: number;
  vpnReady: boolean;
  subnet: string;
};

type Submission = {
  id: string;
  challengeId: string;
  userId: string;
  flag: string;
  result: "success" | "fail";
  pointsAwarded: number;
  ip: string;
  at: string;
};

type CtfEvent = {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  type: "individual" | "equipos";
  maxParticipants: number;
  registered: number;
  status: "pendiente" | "activo" | "finalizado";
  rules: string[];
  challengeIds: string[];
};

type AuditLog = {
  id: string;
  user: string;
  action: string;
  detail: string;
  ip: string;
  at: string;
  level: "info" | "warn" | "critical";
};

type AiMessage = {
  id: string;
  from: "user" | "assistant";
  content: string;
  at: string;
  sources?: string[];
};

type AiConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: AiMessage[];
};

export const currentUser: User = {
  id: "u-001",
  fullName: "Aldair Torrez",
  email: "atorrez@emi.edu.bo",
  cadetId: "CQ-990-ALPHA",
  role: "competidor",
  avatarColor: "#ef4444",
  status: "active",
  points: 1860,
  resolvedChallenges: 14,
  rank: 7,
  joinedAt: "2026-03-12",
};

export const users: User[] = [
  currentUser,
  {
    id: "u-002",
    fullName: "Franco Aparicio",
    email: "faparicio@emi.edu.bo",
    cadetId: "CQ-991-ALPHA",
    role: "competidor",
    avatarColor: "#22d3ee",
    status: "active",
    points: 2410,
    resolvedChallenges: 18,
    rank: 3,
    joinedAt: "2026-03-08",
  },
  {
    id: "u-003",
    fullName: "Roger Bautista",
    email: "rbautista@emi.edu.bo",
    cadetId: "CQ-992-ALPHA",
    role: "competidor",
    avatarColor: "#a855f7",
    status: "active",
    points: 2310,
    resolvedChallenges: 17,
    rank: 4,
    joinedAt: "2026-03-09",
  },
  {
    id: "u-004",
    fullName: "Yhonatan Mamani",
    email: "ymamani@emi.edu.bo",
    cadetId: "CQ-993-ALPHA",
    role: "moderador",
    avatarColor: "#f59e0b",
    status: "active",
    points: 0,
    resolvedChallenges: 0,
    rank: 0,
    joinedAt: "2026-03-05",
  },
  {
    id: "u-005",
    fullName: "Denis Patzi",
    email: "dpatzi@emi.edu.bo",
    cadetId: "CQ-994-ALPHA",
    role: "instructor",
    avatarColor: "#10b981",
    status: "active",
    points: 0,
    resolvedChallenges: 0,
    rank: 0,
    joinedAt: "2026-02-28",
  },
  {
    id: "u-006",
    fullName: "Claudia Yaniquez",
    email: "cyaniquez@emi.edu.bo",
    cadetId: "CQ-001-DOC",
    role: "admin",
    avatarColor: "#ec4899",
    status: "active",
    points: 0,
    resolvedChallenges: 0,
    rank: 0,
    joinedAt: "2026-02-20",
  },
  {
    id: "u-007",
    fullName: "Camila Rojas",
    email: "crojas@emi.edu.bo",
    cadetId: "CQ-995-BRAVO",
    role: "competidor",
    avatarColor: "#3b82f6",
    status: "active",
    points: 2980,
    resolvedChallenges: 22,
    rank: 1,
    joinedAt: "2026-03-03",
  },
  {
    id: "u-008",
    fullName: "Mauricio Vega",
    email: "mvega@emi.edu.bo",
    cadetId: "CQ-996-BRAVO",
    role: "competidor",
    avatarColor: "#84cc16",
    status: "active",
    points: 2620,
    resolvedChallenges: 20,
    rank: 2,
    joinedAt: "2026-03-04",
  },
  {
    id: "u-009",
    fullName: "Lucía Mendoza",
    email: "lmendoza@emi.edu.bo",
    cadetId: "CQ-997-BRAVO",
    role: "competidor",
    avatarColor: "#06b6d4",
    status: "blocked",
    points: 410,
    resolvedChallenges: 4,
    rank: 22,
    joinedAt: "2026-03-15",
  },
];

export const teams: Team[] = [
  {
    id: "t-001",
    name: "RedSquad",
    emblem: "🛡",
    motto: "Penetrate. Document. Repeat.",
    leaderId: "u-001",
    members: ["u-001", "u-002", "u-003"],
    points: 6580,
    resolved: 49,
    createdAt: "2026-03-14",
  },
  {
    id: "t-002",
    name: "BlueWatch",
    emblem: "🛰",
    motto: "Defensa primero, contraataque después.",
    leaderId: "u-007",
    members: ["u-007", "u-008"],
    points: 5600,
    resolved: 42,
    createdAt: "2026-03-12",
  },
  {
    id: "t-003",
    name: "PurpleOps",
    emblem: "🔐",
    motto: "Threat hunters de la EMI.",
    leaderId: "u-009",
    members: ["u-009"],
    points: 410,
    resolved: 4,
    createdAt: "2026-03-20",
  },
];

export const challenges: Challenge[] = [
  {
    id: "c-001",
    title: "SQLi en Login Legacy",
    description:
      "Una aplicación antigua de gestión de cadetes expone su login sin sanitizar parámetros. Encuentra la flag dentro del registro de un usuario administrador.",
    category: "Web",
    difficulty: "Principiante",
    points: 100,
    solves: 78,
    hidden: false,
    resources: [
      { name: "login_legacy.zip", sizeKb: 412, format: "ZIP" },
      { name: "guide.pdf", sizeKb: 138, format: "PDF" },
    ],
    hints: [
      { id: "h-1", cost: 10, preview: "Piensa en cómo se construye la consulta SQL.", locked: true },
      { id: "h-2", cost: 25, preview: "Comentar el resto de la consulta es válido.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.2,
  },
  {
    id: "c-002",
    title: "RSA con primos pequeños",
    description:
      "Un servicio firma boletines internos con una llave RSA débil. Recupera la clave privada y descifra el mensaje original.",
    category: "Crypto",
    difficulty: "Intermedio",
    points: 250,
    solves: 32,
    hidden: false,
    resources: [
      { name: "ciphertext.txt", sizeKb: 2, format: "TXT" },
      { name: "pubkey.pem", sizeKb: 1, format: "PEM" },
    ],
    hints: [
      { id: "h-1", cost: 30, preview: "n se puede factorizar.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.5,
  },
  {
    id: "c-003",
    title: "Buffer Overflow Cadete",
    description:
      "El binario simula un sistema de check-in. Encuentra la vulnerabilidad de pila y obtén una shell.",
    category: "Pwn",
    difficulty: "Avanzado",
    points: 500,
    solves: 9,
    hidden: false,
    resources: [
      { name: "checkin", sizeKb: 18, format: "ELF" },
    ],
    hints: [
      { id: "h-1", cost: 50, preview: "Hay un canary; búscalo en el stack.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.8,
  },
  {
    id: "c-004",
    title: "Imagen con secreto",
    description:
      "Una imagen JPG fue interceptada en un ejercicio Red Team. Aplica técnicas forenses y de esteganografía para recuperar la flag.",
    category: "Forense",
    difficulty: "Principiante",
    points: 150,
    solves: 64,
    hidden: false,
    resources: [{ name: "intercepted.jpg", sizeKb: 540, format: "JPG" }],
    hints: [
      { id: "h-1", cost: 15, preview: "EXIF puede revelar coordenadas.", locked: true },
      { id: "h-2", cost: 35, preview: "Steghide acepta passphrase vacío.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.0,
  },
  {
    id: "c-005",
    title: "OSINT Cadete Perdido",
    description:
      "Un cadete dejó pistas en redes públicas antes de un ejercicio. Reúne suficiente información para confirmar su ubicación.",
    category: "OSINT",
    difficulty: "Intermedio",
    points: 200,
    solves: 41,
    hidden: false,
    resources: [],
    hints: [
      { id: "h-1", cost: 20, preview: "Username pivoting es tu amigo.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 3.9,
  },
  {
    id: "c-006",
    title: "Reverse: Token Generator",
    description:
      "Un binario genera tokens internos. Estudia el algoritmo y genera el token de un usuario administrador.",
    category: "Reverse",
    difficulty: "Intermedio",
    points: 300,
    solves: 18,
    hidden: false,
    resources: [{ name: "tokenizer", sizeKb: 26, format: "ELF" }],
    hints: [
      { id: "h-1", cost: 40, preview: "Hay XOR con una key estática.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.3,
  },
  {
    id: "c-007",
    title: "XSS al Panel del Moderador",
    description:
      "El panel de moderación admite contenido sin sanitizar. Roba la cookie de sesión del moderador y obtén la flag.",
    category: "Web",
    difficulty: "Intermedio",
    points: 280,
    solves: 24,
    hidden: false,
    resources: [{ name: "panel.zip", sizeKb: 220, format: "ZIP" }],
    hints: [
      { id: "h-1", cost: 25, preview: "El campo de notas refleja entrada cruda.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 4.1,
  },
  {
    id: "c-008",
    title: "Hash quebrado",
    description:
      "Te interceptaron un hash en un canal lateral. Recupera la contraseña en texto plano.",
    category: "Crypto",
    difficulty: "Principiante",
    points: 120,
    solves: 95,
    hidden: false,
    resources: [{ name: "hash.txt", sizeKb: 1, format: "TXT" }],
    hints: [
      { id: "h-1", cost: 10, preview: "Es un hash común sin salt.", locked: true },
    ],
    flagFormat: "FLAG{...}",
    rating: 3.6,
  },
];

export const learningModules: LearningModule[] = [
  {
    id: "m-001",
    title: "Fundamentos de Seguridad Web",
    description:
      "Inyecciones, autenticación, XSS y técnicas modernas de bypass aplicadas a aplicaciones web reales.",
    category: "Web",
    level: "Principiante",
    progress: 60,
    lessons: [
      { id: "l-1", title: "OWASP Top 10 explicado", durationMin: 25, completed: true },
      { id: "l-2", title: "Inyección SQL paso a paso", durationMin: 30, completed: true },
      { id: "l-3", title: "XSS reflejado y persistente", durationMin: 35, completed: true },
      { id: "l-4", title: "Bypass de autenticación JWT", durationMin: 45, completed: false },
      { id: "l-5", title: "Evaluación final del módulo", durationMin: 20, completed: false },
    ],
  },
  {
    id: "m-002",
    title: "Criptografía aplicada",
    description:
      "De Cesar a RSA: matemáticas detrás de la criptografía moderna y errores típicos en implementaciones.",
    category: "Crypto",
    level: "Intermedio",
    progress: 30,
    lessons: [
      { id: "l-1", title: "Aritmética modular", durationMin: 20, completed: true },
      { id: "l-2", title: "Cifrado simétrico AES", durationMin: 30, completed: false },
      { id: "l-3", title: "RSA y errores comunes", durationMin: 40, completed: false },
      { id: "l-4", title: "Hashing y MAC", durationMin: 25, completed: false },
    ],
  },
  {
    id: "m-003",
    title: "Pwn / Explotación binaria",
    description:
      "Análisis de pila, ROP, mitigaciones modernas y construcción de exploits funcionales.",
    category: "Pwn",
    level: "Avanzado",
    progress: 0,
    lessons: [
      { id: "l-1", title: "Anatomía de la pila", durationMin: 30, completed: false },
      { id: "l-2", title: "Buffer overflow básico", durationMin: 40, completed: false },
      { id: "l-3", title: "ROP en x86_64", durationMin: 60, completed: false },
    ],
  },
  {
    id: "m-004",
    title: "Forense digital",
    description:
      "Adquisición de evidencia, análisis de memoria y artefactos del sistema en un caso CTF.",
    category: "Forense",
    level: "Intermedio",
    progress: 75,
    lessons: [
      { id: "l-1", title: "Cadena de custodia", durationMin: 20, completed: true },
      { id: "l-2", title: "Volatility básico", durationMin: 35, completed: true },
      { id: "l-3", title: "Análisis de pcap", durationMin: 45, completed: true },
      { id: "l-4", title: "Esteganografía en imágenes", durationMin: 25, completed: false },
    ],
  },
];

export const labs: Record<string, LabEnvironment> = {
  "c-001": {
    challengeId: "c-001",
    status: "running",
    uptimeSec: 1840,
    remainingSec: 1760,
    cpuPct: 18,
    ramMb: 412,
    ramMaxMb: 1024,
    vpnReady: true,
    subnet: "10.10.21.0/24",
  },
  "c-003": {
    challengeId: "c-003",
    status: "stopped",
    uptimeSec: 0,
    remainingSec: 0,
    cpuPct: 0,
    ramMb: 0,
    ramMaxMb: 1024,
    vpnReady: false,
    subnet: "10.10.22.0/24",
  },
};

export const submissions: Submission[] = [
  {
    id: "s-001",
    challengeId: "c-001",
    userId: "u-001",
    flag: "FLAG{sql_injection_101}",
    result: "success",
    pointsAwarded: 100,
    ip: "10.10.21.45",
    at: "2026-05-04 14:21",
  },
  {
    id: "s-002",
    challengeId: "c-004",
    userId: "u-001",
    flag: "FLAG{stego_easy}",
    result: "success",
    pointsAwarded: 150,
    ip: "10.10.24.12",
    at: "2026-05-04 16:47",
  },
  {
    id: "s-003",
    challengeId: "c-002",
    userId: "u-001",
    flag: "intento_invalido",
    result: "fail",
    pointsAwarded: 0,
    ip: "10.10.22.18",
    at: "2026-05-05 09:08",
  },
  {
    id: "s-004",
    challengeId: "c-002",
    userId: "u-001",
    flag: "FLAG{rsa_small_primes}",
    result: "success",
    pointsAwarded: 250,
    ip: "10.10.22.18",
    at: "2026-05-05 09:33",
  },
];

export const events: CtfEvent[] = [
  {
    id: "e-001",
    name: "EMI CyberQuest Cup 2026 — Q1",
    description:
      "Primer evento de clasificación interno. Categorías Web, Crypto y Forense.",
    startsAt: "2026-05-10 09:00",
    endsAt: "2026-05-10 18:00",
    type: "equipos",
    maxParticipants: 80,
    registered: 64,
    status: "activo",
    rules: [
      "Puntuación dinámica con decaimiento.",
      "Penalización -10 pts por flag inválida tras el 5to intento.",
      "Pistas IA permitidas, máximo 2 por reto.",
      "Tiempo máximo por reto: 90 minutos.",
    ],
    challengeIds: ["c-001", "c-002", "c-004", "c-008"],
  },
  {
    id: "e-002",
    name: "Workshop Pwn Avanzado",
    description:
      "Ejercicio práctico exclusivo del módulo de explotación binaria.",
    startsAt: "2026-05-22 15:00",
    endsAt: "2026-05-22 19:00",
    type: "individual",
    maxParticipants: 30,
    registered: 12,
    status: "pendiente",
    rules: [
      "Sin pistas de IA durante el ejercicio.",
      "Solo binarios x86_64 con ASLR habilitado.",
    ],
    challengeIds: ["c-003"],
  },
  {
    id: "e-003",
    name: "CTF Aniversario EMI 2025",
    description: "Edición especial del aniversario, finalizada.",
    startsAt: "2025-11-22 09:00",
    endsAt: "2025-11-22 21:00",
    type: "equipos",
    maxParticipants: 100,
    registered: 100,
    status: "finalizado",
    rules: ["Puntuación estática.", "Sin asistencia de IA."],
    challengeIds: ["c-001", "c-005", "c-006", "c-007"],
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "a-001",
    user: "atorrez@emi.edu.bo",
    action: "submission.success",
    detail: "Reto c-002 (RSA con primos pequeños)",
    ip: "10.10.22.18",
    at: "2026-05-05 09:33:12",
    level: "info",
  },
  {
    id: "a-002",
    user: "lmendoza@emi.edu.bo",
    action: "submission.fail",
    detail: "5 intentos fallidos consecutivos en c-001",
    ip: "10.10.21.92",
    at: "2026-05-05 09:31:50",
    level: "warn",
  },
  {
    id: "a-003",
    user: "ymamani@emi.edu.bo",
    action: "lab.force_shutdown",
    detail: "Apagado forzado de entorno c-003 por consumo anómalo",
    ip: "10.10.22.45",
    at: "2026-05-05 08:57:31",
    level: "critical",
  },
  {
    id: "a-004",
    user: "atorrez@emi.edu.bo",
    action: "auth.login",
    detail: "Login exitoso desde Kali Linux 2024.1",
    ip: "190.181.45.22",
    at: "2026-05-05 08:40:01",
    level: "info",
  },
  {
    id: "a-005",
    user: "dpatzi@emi.edu.bo",
    action: "challenge.create",
    detail: "Nuevo reto: 'XSS al Panel del Moderador'",
    ip: "190.181.45.78",
    at: "2026-05-04 22:11:09",
    level: "info",
  },
];

export const aiConversations: AiConversation[] = [
  {
    id: "conv-001",
    title: "¿Cómo identificar SQL injection?",
    updatedAt: "2026-05-05 09:14",
    messages: [
      {
        id: "m-1",
        from: "user",
        content: "¿Cómo identifico una SQL injection en un login?",
        at: "2026-05-05 09:13",
      },
      {
        id: "m-2",
        from: "assistant",
        content:
          "Buenas pistas: prueba caracteres como ' o \" en el campo de usuario y observa errores SQL en la respuesta. También puedes comparar tiempos de respuesta. No te doy la solución del reto, pero piensa en cómo se concatena la consulta del lado del servidor.",
        at: "2026-05-05 09:14",
        sources: ["OWASP Top 10 - A03 Injection", "Módulo M3 - Lección 2"],
      },
    ],
  },
];

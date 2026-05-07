// Tipos del dominio derivados del documento PEAC.

export type Role = "admin" | "competidor" | "instructor" | "moderador";

export type User = {
  id: string;
  fullName: string;
  email: string;
  cadetId: string;
  role: Role;
  avatarColor: string;
  status: "active" | "blocked";
  points: number;
  resolvedChallenges: number;
  rank: number;
  joinedAt: string;
};

export type Team = {
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

export type ChallengeCategory =
  | "Web"
  | "Crypto"
  | "Pwn"
  | "Forense"
  | "OSINT"
  | "Reverse";

export type ChallengeDifficulty = "Principiante" | "Intermedio" | "Avanzado";

export type Challenge = {
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
  rating: number; // promedio 0-5
};

export type LearningModule = {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  level: ChallengeDifficulty;
  lessons: { id: string; title: string; durationMin: number; completed: boolean }[];
  progress: number; // 0-100
};

export type LabEnvironment = {
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

export type Submission = {
  id: string;
  challengeId: string;
  userId: string;
  flag: string;
  result: "success" | "fail";
  pointsAwarded: number;
  ip: string;
  at: string;
};

export type CtfEvent = {
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

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  detail: string;
  ip: string;
  at: string;
  level: "info" | "warn" | "critical";
};

export type AiMessage = {
  id: string;
  from: "user" | "assistant";
  content: string;
  at: string;
  sources?: string[];
};

export type AiConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: AiMessage[];
};

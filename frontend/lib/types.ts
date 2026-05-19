// Types aligned with the backend API (FastAPI / CyberQuest PEAC)

export type Role = "admin" | "instructor" | "competitor" | "moderator";

export type UserOut = {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  role: Role;
  is_active: boolean;
  mfa_enabled: boolean;
  points: number;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type MFARequired = {
  mfa_required: true;
  temp_token: string;
};

export type MFASetupRequired = {
  mfa_setup_required: true;
  temp_token: string;
  role: Role;
};

export type LoginResult = TokenResponse | MFARequired | MFASetupRequired;

export type ChallengeCategory =
  | "web"
  | "pwn"
  | "crypto"
  | "forensics"
  | "reverse"
  | "misc"
  | "osint";

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "insane";

export type HintOut = {
  id: string;
  cost: number;
  text: string | null;
  revealed: boolean;
};

export type ChallengeOut = {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  description: string;
  solvers_count: number;
  is_featured: boolean;
};

export type ChallengeDetailOut = ChallengeOut & {
  long_description: string;
  hints: HintOut[];
  first_blood_username: string | null;
  attachment_url: string | null;
};

export type MemberOut = {
  user_id: string;
  username: string;
  role: "captain" | "member";
  points: number;
};

export type TeamOut = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  member_count: number;
  total_points: number;
};

export type TeamDetailOut = TeamOut & {
  members: MemberOut[];
};

export type EventOut = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  max_teams: number | null;
  registered_teams_count: number;
};

export type FlagSubmitResponse = {
  correct: boolean;
  message: string;
  points_earned: number;
};

export type LeaderboardUser = {
  rank: number;
  user_id: string;
  username: string;
  points: number;
  solves_count: number;
  team_name: string | null;
};

export type LeaderboardTeam = {
  rank: number;
  team_id: string;
  name: string;
  slug: string;
  member_count: number;
  total_points: number;
};

export type AdminUserOut = {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  role: Role;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  points: number;
  created_at: string;
};

export type ChallengeAdminOut = {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  description: string;
  long_description: string;
  is_active: boolean;
  is_featured: boolean;
  solvers_count: number;
  attachment_url: string | null;
  max_attempts: number | null;
  created_at: string;
  updated_at: string;
};

export type MySubmission = {
  id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_category: ChallengeCategory;
  challenge_points: number;
  is_correct: boolean;
  submitted_at: string;
};

export type MyStats = {
  total_submissions: number;
  correct_submissions: number;
  wrong_submissions: number;
  points: number;
  accuracy: number;
};

export type ChallengeCreateRequest = {
  title: string;
  description: string;
  long_description?: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  flag: string;
  attachment_url?: string;
  max_attempts?: number;
  is_active?: boolean;
  is_featured?: boolean;
};

// ===========================================================================
// Módulo 10 — Eventos CTF v2
// ===========================================================================

export type EventStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "ended";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type TicketCategory = "technical" | "challenge" | "dispute" | "other";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type RewardKind =
  | "first_place"
  | "second_place"
  | "third_place"
  | "honorable"
  | "special";

export type EventAdminOut = {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner_url: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_public: boolean;
  max_teams: number | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  registered_teams_count: number;
  challenges_count: number;
};

export type EventCreateRequest = {
  title: string;
  slug: string;
  description?: string;
  banner_url?: string;
  starts_at: string;
  ends_at: string;
  max_teams?: number | null;
  is_public?: boolean;
};

export type EventUpdateRequest = Partial<EventCreateRequest>;

export type EventRuleOut = {
  id: string;
  key: string;
  value: string;
  created_at: string;
};

export type EventControlAction =
  | "schedule"
  | "start"
  | "pause"
  | "resume"
  | "end";

export type AnnouncementOut = {
  id: string;
  event_id: string;
  author_username: string | null;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

export type AnnouncementCreateRequest = {
  title: string;
  body: string;
  pinned?: boolean;
};

export type RewardOut = {
  id: string;
  event_id: string;
  team_id: string | null;
  team_name: string | null;
  user_id: string | null;
  username: string | null;
  kind: RewardKind;
  title: string;
  description: string;
  points_bonus: number;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
};

export type RewardCreateRequest = {
  team_id?: string;
  user_id?: string;
  kind: RewardKind;
  title: string;
  description?: string;
  points_bonus?: number;
};

export type RegistrationOut = {
  id: string;
  event_id: string;
  team_id: string;
  team_name: string;
  status: RegistrationStatus;
  rejection_reason: string | null;
  registered_at: string;
  validated_at: string | null;
  validated_by_username: string | null;
};

export type RegistrationValidateRequest = {
  approve: boolean;
  rejection_reason?: string;
};

export type TicketOut = {
  id: string;
  event_id: string;
  user_id: string;
  username: string;
  subject: string;
  body: string;
  category: TicketCategory;
  status: TicketStatus;
  response: string | null;
  assigned_to_username: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type TicketCreateRequest = {
  subject: string;
  body: string;
  category?: TicketCategory;
};

export type TicketUpdateRequest = {
  status?: TicketStatus;
  response?: string;
  assigned_to_id?: string;
};

export type EventChallengeOut = {
  id: string;
  challenge_id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  order: number;
};

export type ScoreboardEntry = {
  team_id: string;
  team_name: string;
  points: number;
  solves: number;
  rank: number;
};

export type ScoreboardOut = {
  event_id: string;
  entries: ScoreboardEntry[];
  generated_at: string;
};

// ===========================================================================
// Módulo 9 — Asistencia IA v2
// ===========================================================================

export type AIPromptKind =
  | "base"
  | "explain_concept"
  | "recommend_challenge"
  | "generate_feedback";

export type AIQueryMode =
  | "chat"
  | "explain_concept"
  | "recommend_challenge"
  | "generate_feedback";

export type PromptOut = {
  id: string;
  kind: AIPromptKind;
  content: string;
  updated_at: string;
  updated_by_username: string | null;
};

export type AISettingsOut = {
  provider: string;
  model: string;
  api_base_url: string | null;
  api_key_set: boolean;
  max_tokens: number;
  temperature_x100: number;
  daily_quota_per_user: number;
  last_connection_ok: boolean;
  last_connection_at: string | null;
  last_connection_message: string | null;
  updated_at: string;
};

export type AIConfigRequest = {
  provider: string;
  model: string;
  api_base_url?: string;
  api_key?: string;
  max_tokens: number;
  temperature_x100: number;
};

export type AILimitsRequest = {
  daily_quota_per_user: number;
};

export type DocumentOut = {
  id: string;
  title: string;
  description: string;
  source_url: string | null;
  indexed: boolean;
  indexed_at: string | null;
  uploaded_by_username: string | null;
  created_at: string;
  content_preview: string | null;
};

export type DocumentUploadRequest = {
  title: string;
  description?: string;
  source_url?: string;
  content: string;
};

export type AskRequest = {
  message: string;
  mode?: AIQueryMode;
  conversation_id?: string;
};

export type AskResponse = {
  conversation_id: string;
  message_id: string;
  answer: string;
  mode: AIQueryMode;
  quota_used_today: number;
  quota_limit: number;
};

export type MessageOut = {
  id: string;
  role: "user" | "assistant";
  mode: string | null;
  content: string;
  created_at: string;
};

export type ConversationListOut = {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  message_count: number;
};

export type ConversationDetailOut = {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  messages: MessageOut[];
};

export type ConsumptionSummaryOut = {
  total_requests: number;
  total_tokens_in: number;
  total_tokens_out: number;
  requests_today: number;
  active_users_today: number;
  top_users: {
    user_id: string;
    username: string;
    requests: number;
    tokens: number;
  }[];
};

export type HistoryEntryOut = {
  conversation_id: string;
  username: string;
  title: string;
  mode: string;
  message_count: number;
  updated_at: string;
};

// ===========================================================================
// Academy courses (Instructor / Admin)
// ===========================================================================

export type CourseLevel = "basico" | "intermedio" | "avanzado";

export type CourseOut = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: string;
  duration_hours: number;
  cover_url: string | null;
  is_published: boolean;
  author_username: string | null;
  modules_count: number;
  created_at: string;
  updated_at: string;
};

export type ModuleOut = {
  id: string;
  title: string;
  content: string;
  order: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
};

export type CourseDetailOut = CourseOut & {
  modules: ModuleOut[];
};

export type CourseCreateRequest = {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  level?: string;
  duration_hours?: number;
  cover_url?: string;
  is_published?: boolean;
};

export type CourseUpdateRequest = Partial<CourseCreateRequest>;

export type ModuleCreateRequest = {
  title: string;
  content?: string;
  order?: number;
  duration_minutes?: number;
};

export type ModuleUpdateRequest = Partial<ModuleCreateRequest>;

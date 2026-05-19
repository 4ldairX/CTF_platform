// API client — no "use client" directive (plain module, safe for both client and server)
import type {
  TokenResponse,
  LoginResult,
  UserOut,
  ChallengeOut,
  ChallengeDetailOut,
  HintOut,
  FlagSubmitResponse,
  TeamOut,
  TeamDetailOut,
  EventOut,
  LeaderboardUser,
  LeaderboardTeam,
  AdminUserOut,
  ChallengeAdminOut,
  ChallengeCreateRequest,
  MySubmission,
  MyStats,
  // M10
  EventAdminOut,
  EventCreateRequest,
  EventUpdateRequest,
  EventRuleOut,
  EventControlAction,
  AnnouncementOut,
  AnnouncementCreateRequest,
  RewardOut,
  RewardCreateRequest,
  RegistrationOut,
  RegistrationValidateRequest,
  TicketOut,
  TicketCreateRequest,
  TicketUpdateRequest,
  EventChallengeOut,
  ScoreboardOut,
  // M9
  PromptOut,
  AIPromptKind,
  AISettingsOut,
  AIConfigRequest,
  AILimitsRequest,
  DocumentOut,
  DocumentUploadRequest,
  AskRequest,
  AskResponse,
  ConversationListOut,
  ConversationDetailOut,
  ConsumptionSummaryOut,
  HistoryEntryOut,
  // Academy
  CourseOut,
  CourseDetailOut,
  CourseCreateRequest,
  CourseUpdateRequest,
  ModuleOut,
  ModuleCreateRequest,
  ModuleUpdateRequest,
} from "@/lib/types";

const BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000";

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function getToken(key: "cq_access" | "cq_refresh"): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("cq_access", access);
  localStorage.setItem("cq_refresh", refresh);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cq_access");
  localStorage.removeItem("cq_refresh");
}

// ---------------------------------------------------------------------------
// Core request helper with auto-refresh on 401
// ---------------------------------------------------------------------------

let _refreshing: Promise<void> | null = null;

async function request<T>(
  path: string,
  opts: RequestInit = {},
  _retry = false,
): Promise<T> {
  const headers = new Headers((opts.headers as HeadersInit) ?? {});
  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken("cq_access");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  // Auto-refresh on 401 (once per request to avoid infinite loops)
  if (res.status === 401 && !_retry) {
    const refreshToken = getToken("cq_refresh");
    if (refreshToken) {
      // Serialize concurrent refresh attempts
      if (!_refreshing) {
        _refreshing = (async () => {
          try {
            const refreshRes = await fetch(`${BASE}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const data: TokenResponse = await refreshRes.json();
              setTokens(data.access_token, data.refresh_token);
            } else {
              clearTokens();
            }
          } catch {
            clearTokens();
          } finally {
            _refreshing = null;
          }
        })();
      }
      await _refreshing;
      return request<T>(path, opts, true);
    }
    clearTokens();
  }

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(res.status, detail);
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const auth = {
  register(data: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(email: string, password: string): Promise<LoginResult> {
    return request<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  mfaValidate(temp_token: string, code: string): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/mfa/validate", {
      method: "POST",
      body: JSON.stringify({ temp_token, code }),
    });
  },

  mfaSetup(): Promise<{ secret: string; uri: string; qr_data_url: string }> {
    return request<{ secret: string; uri: string; qr_data_url: string }>(
      "/auth/mfa/setup",
      { method: "POST" },
    );
  },

  mfaVerify(code: string): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  mfaForceSetupStart(
    temp_token: string,
  ): Promise<{ secret: string; uri: string; qr_data_url: string }> {
    return request<{ secret: string; uri: string; qr_data_url: string }>(
      "/auth/mfa/force-setup/start",
      {
        method: "POST",
        body: JSON.stringify({ temp_token }),
      },
    );
  },

  mfaForceSetupConfirm(
    temp_token: string,
    code: string,
  ): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/mfa/force-setup/confirm", {
      method: "POST",
      body: JSON.stringify({ temp_token, code }),
    });
  },

  me(): Promise<UserOut> {
    return request<UserOut>("/auth/me");
  },

  updateMe(data: {
    display_name?: string;
    bio?: string;
    country?: string;
    avatar_url?: string;
  }): Promise<UserOut> {
    return request<UserOut>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  mySubmissions(limit = 50): Promise<MySubmission[]> {
    return request<MySubmission[]>(`/auth/me/submissions?limit=${limit}`);
  },

  myStats(): Promise<MyStats> {
    return request<MyStats>("/auth/me/stats");
  },

  refresh(refresh_token: string): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    });
  },
};

// ---------------------------------------------------------------------------
// Challenges endpoints
// ---------------------------------------------------------------------------

export const challenges = {
  list(params?: { category?: string; difficulty?: string }): Promise<ChallengeOut[]> {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
          .join("&")
      : "";
    return request<ChallengeOut[]>(`/challenges${qs}`);
  },

  get(id: string): Promise<ChallengeDetailOut> {
    return request<ChallengeDetailOut>(`/challenges/${id}`);
  },

  submit(id: string, flag: string): Promise<FlagSubmitResponse> {
    return request<FlagSubmitResponse>(`/challenges/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ flag }),
    });
  },

  revealHint(challengeId: string, hintId: string): Promise<HintOut> {
    return request<HintOut>(`/challenges/${challengeId}/hints/${hintId}`, {
      method: "POST",
    });
  },

  solvers(
    id: string,
  ): Promise<Array<{ user_id: string; username: string; solved_at: string }>> {
    return request<
      Array<{ user_id: string; username: string; solved_at: string }>
    >(`/challenges/${id}/solvers`);
  },
};

// ---------------------------------------------------------------------------
// Teams endpoints
// ---------------------------------------------------------------------------

export const teams = {
  list(): Promise<TeamOut[]> {
    return request<TeamOut[]>("/teams");
  },

  create(data: { name: string; description?: string }): Promise<TeamDetailOut> {
    return request<TeamDetailOut>("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  get(id: string): Promise<TeamDetailOut> {
    return request<TeamDetailOut>(`/teams/${id}`);
  },

  join(id: string): Promise<unknown> {
    return request<unknown>(`/teams/${id}/join`, { method: "POST" });
  },

  async myTeam(): Promise<TeamDetailOut | null> {
    try {
      return await request<TeamDetailOut>("/teams/my");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
};

// ---------------------------------------------------------------------------
// Events endpoints
// ---------------------------------------------------------------------------

export const events = {
  list(): Promise<EventOut[]> {
    return request<EventOut[]>("/events");
  },

  get(id: string): Promise<EventOut> {
    return request<EventOut>(`/events/${id}`);
  },

  register(id: string, team_id: string): Promise<unknown> {
    return request<unknown>(`/events/${id}/register`, {
      method: "POST",
      body: JSON.stringify({ team_id }),
    });
  },
};

// ---------------------------------------------------------------------------
// Leaderboard endpoints
// ---------------------------------------------------------------------------

export const leaderboard = {
  users(): Promise<LeaderboardUser[]> {
    return request<LeaderboardUser[]>("/leaderboard/");
  },

  teams(): Promise<LeaderboardTeam[]> {
    return request<LeaderboardTeam[]>("/leaderboard/teams");
  },
};

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

export const admin = {
  stats(): Promise<{
    total_users: number;
    total_challenges: number;
    total_teams: number;
    total_solves: number;
    role_counts: {
      admin: number;
      instructor: number;
      moderator: number;
      competitor: number;
    };
  }> {
    return request("/admin/stats");
  },

  users(): Promise<AdminUserOut[]> {
    return request("/admin/users");
  },

  updateUser(
    id: string,
    data: { role?: string; is_active?: boolean; display_name?: string },
  ): Promise<AdminUserOut> {
    return request(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteUser(id: string): Promise<void> {
    return request(`/admin/users/${id}`, { method: "DELETE" });
  },

  challenges(): Promise<ChallengeAdminOut[]> {
    return request("/admin/challenges");
  },

  createChallenge(data: ChallengeCreateRequest): Promise<ChallengeAdminOut> {
    return request("/admin/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateChallenge(
    id: string,
    data: Partial<ChallengeCreateRequest>,
  ): Promise<ChallengeAdminOut> {
    return request(`/admin/challenges/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteChallenge(id: string): Promise<void> {
    return request(`/admin/challenges/${id}`, { method: "DELETE" });
  },

  submissions(limit = 100): Promise<
    Array<{
      id: string;
      username: string;
      challenge_title: string;
      challenge_category: string;
      is_correct: boolean;
      submitted_at: string;
    }>
  > {
    return request(`/admin/submissions?limit=${limit}`);
  },

  getSettings(): Promise<Record<string, string>> {
    return request("/admin/settings");
  },

  updateSettings(payload: Record<string, string>): Promise<Record<string, string>> {
    return request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Módulo 10 — Eventos CTF v2
// ---------------------------------------------------------------------------

export const adminEvents = {
  list(): Promise<EventAdminOut[]> {
    return request("/admin/events/");
  },
  get(id: string): Promise<EventAdminOut> {
    return request(`/admin/events/${id}`);
  },
  create(data: EventCreateRequest): Promise<EventAdminOut> {
    return request("/admin/events/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: EventUpdateRequest): Promise<EventAdminOut> {
    return request(`/admin/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  remove(id: string): Promise<void> {
    return request(`/admin/events/${id}`, { method: "DELETE" });
  },
  listRules(id: string): Promise<EventRuleOut[]> {
    return request(`/admin/events/${id}/rules`);
  },
  configureRules(
    id: string,
    rules: { key: string; value: string }[],
  ): Promise<EventRuleOut[]> {
    return request(`/admin/events/${id}/rules`, {
      method: "PUT",
      body: JSON.stringify({ rules }),
    });
  },
  control(id: string, action: EventControlAction): Promise<EventAdminOut> {
    return request(`/admin/events/${id}/control`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },
  listRewards(id: string): Promise<RewardOut[]> {
    return request(`/admin/events/${id}/rewards`);
  },
  grantReward(id: string, data: RewardCreateRequest): Promise<RewardOut> {
    return request(`/admin/events/${id}/rewards`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const moderatorEvents = {
  control(id: string, action: EventControlAction): Promise<unknown> {
    return request(`/moderator/events/${id}/control`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },
  listAnnouncements(id: string): Promise<AnnouncementOut[]> {
    return request(`/moderator/events/${id}/announcements`);
  },
  publishAnnouncement(
    id: string,
    data: AnnouncementCreateRequest,
  ): Promise<AnnouncementOut> {
    return request(`/moderator/events/${id}/announcements`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deleteAnnouncement(eventId: string, annId: string): Promise<void> {
    return request(`/moderator/events/${eventId}/announcements/${annId}`, {
      method: "DELETE",
    });
  },
  listRegistrations(id: string): Promise<RegistrationOut[]> {
    return request(`/moderator/events/${id}/registrations`);
  },
  validateRegistration(
    eventId: string,
    regId: string,
    data: RegistrationValidateRequest,
  ): Promise<RegistrationOut> {
    return request(
      `/moderator/events/${eventId}/registrations/${regId}/validate`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },
  listTickets(id: string): Promise<TicketOut[]> {
    return request(`/moderator/events/${id}/tickets`);
  },
  updateTicket(
    eventId: string,
    ticketId: string,
    data: TicketUpdateRequest,
  ): Promise<TicketOut> {
    return request(`/moderator/events/${eventId}/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  listEventChallenges(id: string): Promise<EventChallengeOut[]> {
    return request(`/moderator/events/${id}/challenges`);
  },
  assignChallenge(
    eventId: string,
    challenge_id: string,
    order = 0,
  ): Promise<EventChallengeOut> {
    return request(`/moderator/events/${eventId}/challenges`, {
      method: "POST",
      body: JSON.stringify({ challenge_id, order }),
    });
  },
  unassignChallenge(eventId: string, challengeId: string): Promise<void> {
    return request(`/moderator/events/${eventId}/challenges/${challengeId}`, {
      method: "DELETE",
    });
  },
  scoreboard(id: string): Promise<ScoreboardOut> {
    return request(`/moderator/events/${id}/scoreboard`);
  },
};

// Public event endpoints (competitor / any role)
export const eventsExt = {
  listAnnouncements(id: string): Promise<AnnouncementOut[]> {
    return request(`/events/${id}/announcements`);
  },
  sendTicket(id: string, data: TicketCreateRequest): Promise<TicketOut> {
    return request(`/events/${id}/tickets`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  myTickets(id: string): Promise<TicketOut[]> {
    return request(`/events/${id}/tickets/mine`);
  },
};

// ---------------------------------------------------------------------------
// Módulo 9 — Asistencia IA v2
// ---------------------------------------------------------------------------

export const ai = {
  // Competitor
  ask(data: AskRequest): Promise<AskResponse> {
    return request("/ai/ask", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  myConversations(): Promise<ConversationListOut[]> {
    return request("/ai/my-conversations");
  },
  conversation(id: string): Promise<ConversationDetailOut> {
    return request(`/ai/my-conversations/${id}`);
  },
  // Admin
  listPrompts(): Promise<PromptOut[]> {
    return request("/ai/prompts");
  },
  upsertPrompt(kind: AIPromptKind, content: string): Promise<PromptOut> {
    return request("/ai/prompts", {
      method: "PUT",
      body: JSON.stringify({ kind, content }),
    });
  },
  getLimits(): Promise<AISettingsOut> {
    return request("/ai/limits");
  },
  updateLimits(data: AILimitsRequest): Promise<AISettingsOut> {
    return request("/ai/limits", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  getConfig(): Promise<AISettingsOut> {
    return request("/ai/config");
  },
  updateConfig(data: AIConfigRequest): Promise<AISettingsOut> {
    return request("/ai/config", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  consumption(): Promise<ConsumptionSummaryOut> {
    return request("/ai/consumption");
  },
  // Admin + Instructor
  listDocuments(): Promise<DocumentOut[]> {
    return request("/ai/documents");
  },
  uploadDocument(data: DocumentUploadRequest): Promise<DocumentOut> {
    return request("/ai/documents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  indexDocument(id: string): Promise<DocumentOut> {
    return request(`/ai/documents/${id}/index`, { method: "POST" });
  },
  deleteDocument(id: string): Promise<void> {
    return request(`/ai/documents/${id}`, { method: "DELETE" });
  },
  history(limit = 50): Promise<HistoryEntryOut[]> {
    return request(`/ai/history?limit=${limit}`);
  },
};

// ---------------------------------------------------------------------------
// Academy courses (Instructor / Admin)
// ---------------------------------------------------------------------------

export const courses = {
  list(): Promise<CourseOut[]> {
    return request("/courses/");
  },
  get(id: string): Promise<CourseDetailOut> {
    return request(`/courses/${id}`);
  },
  create(data: CourseCreateRequest): Promise<CourseDetailOut> {
    return request("/courses/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: CourseUpdateRequest): Promise<CourseDetailOut> {
    return request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  remove(id: string): Promise<void> {
    return request(`/courses/${id}`, { method: "DELETE" });
  },
  addModule(courseId: string, data: ModuleCreateRequest): Promise<ModuleOut> {
    return request(`/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateModule(
    courseId: string,
    moduleId: string,
    data: ModuleUpdateRequest,
  ): Promise<ModuleOut> {
    return request(`/courses/${courseId}/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteModule(courseId: string, moduleId: string): Promise<void> {
    return request(`/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE",
    });
  },
};

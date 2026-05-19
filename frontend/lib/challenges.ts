export type ChallengeCategory = "WEB" | "PWN" | "CRYPTO" | "MISC" | "FORENSICS";
export type ChallengeDifficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "INSANE"
  | "EXTREME";

export type Challenge = {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  description: string;
  longDescription: string;
  solvers: number;
  firstBlood: string;
  flag: string;
  hints: { id: string; text: string; cost: number }[];
  resources?: string[];
  featured?: boolean;
};

export const CHALLENGES: Record<string, Challenge> = {
  titans: {
    id: "titans",
    title: "TITANS FALL: BROKEN API",
    category: "WEB",
    difficulty: "EXTREME",
    points: 500,
    description:
      "Infiltrate the internal logistics API of Titan Corp. Exploitation of improper authentication headers required for flag retrieval.",
    longDescription:
      "Titan Corp's logistics control surface relies on a JWT-bearing internal API. Reconnaissance has confirmed the gateway leaks debug routes that bypass HMAC validation. Your mission: pivot from the public endpoint, escalate via header injection, and exfiltrate the operations manifest. The flag is held in a privileged route only accessible after impersonating a fleet supervisor.",
    solvers: 14,
    firstBlood: "v0id_walker",
    flag: "flag{titans_fall_to_jwt_none}",
    hints: [
      {
        id: "h1",
        text: "Inspect the JWT algorithm header. Some legacy gateways still trust 'none'.",
        cost: 25,
      },
      {
        id: "h2",
        text: "The /v1/internal/manifest route filters on the X-Forwarded-User header — but only when it sees the gateway's signature.",
        cost: 50,
      },
      {
        id: "h3",
        text: "Look for the supervisor handle in the public job postings page.",
        cost: 75,
      },
    ],
    resources: ["titans-recon.pcap", "logistics-openapi.json"],
    featured: true,
  },
  xss: {
    id: "xss",
    title: "Cross-Site Alchemy",
    category: "WEB",
    difficulty: "MEDIUM",
    points: 280,
    description:
      "A vulnerable comments engine reflects user payloads into the admin dashboard.",
    longDescription:
      "The target application sanitizes <script> tags but its markdown renderer still emits inline event handlers. Craft a payload that fires when the admin previews your post and exfiltrate their session token to your collector.",
    solvers: 86,
    firstBlood: "n3on_phantom",
    flag: "flag{img_onerror_is_forever}",
    hints: [
      {
        id: "h1",
        text: "Tag filters drop scripts but allow <img> attributes.",
        cost: 15,
      },
      {
        id: "h2",
        text: "Cookies are HttpOnly — the goal is the CSRF token, not the session.",
        cost: 35,
      },
    ],
    resources: ["alchemy-app.zip"],
  },
  scoreboard: {
    id: "scoreboard",
    title: "Top Ranking",
    category: "MISC",
    difficulty: "EASY",
    points: 120,
    description:
      "A misconfigured scoreboard endpoint reveals admin handles in plain text.",
    longDescription:
      "The public ranking page caches an internal API response. The same response object includes hidden 'admin_id' fields stripped by the front-end but never by the cache layer. Read the raw response and recover the operator alias.",
    solvers: 312,
    firstBlood: "kr4ken",
    flag: "flag{cache_layer_is_a_liar}",
    hints: [
      {
        id: "h1",
        text: "Disable JavaScript and watch what the page shows you.",
        cost: 10,
      },
    ],
  },
  prime: {
    id: "prime",
    title: "Prime Suspects",
    category: "CRYPTO",
    difficulty: "HARD",
    points: 250,
    description:
      "RSA implementation reuses a prime across two key pairs. Recover the message.",
    longDescription:
      "Two ciphertexts. Two public keys. One shared prime. The factorization is trivial once you spot it — the rest is modular arithmetic. The flag is the decrypted plaintext, formatted as flag{...}.",
    solvers: 47,
    firstBlood: "Enigma",
    flag: "flag{shared_primes_break_everything}",
    hints: [
      {
        id: "h1",
        text: "GCD is your friend.",
        cost: 20,
      },
      {
        id: "h2",
        text: "Once you have p, q1 and q2 fall out. Use extended Euclid for the inverse.",
        cost: 60,
      },
    ],
    resources: ["pubkeys.pem", "ciphertexts.b64"],
  },
  bof: {
    id: "bof",
    title: "Buffer Overflow 101",
    category: "PWN",
    difficulty: "MEDIUM",
    points: 180,
    description:
      "Smash a stack canary-less binary to redirect execution to win().",
    longDescription:
      "32-bit ELF, no canary, no PIE, no ASLR. The win() function is already linked in. Find the offset to the saved EIP and overwrite it. The flag is read by the binary itself when win() is called.",
    solvers: 152,
    firstBlood: "bin_ripper",
    flag: "flag{eip_is_a_state_of_mind}",
    hints: [
      {
        id: "h1",
        text: "Use a cyclic pattern to find the offset quickly.",
        cost: 15,
      },
      {
        id: "h2",
        text: "The win() symbol is at a fixed address. objdump will show it.",
        cost: 30,
      },
    ],
    resources: ["bof-101.elf", "bof-101.c"],
  },
};

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES[id];
}

export function listChallenges(): Challenge[] {
  return Object.values(CHALLENGES);
}

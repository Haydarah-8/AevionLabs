export type GameId = "run" | "catch" | "smash" | "type" | "snake" | "stack";
export type SpeedId = "slow" | "normal" | "fast" | "insane";

export type PlaySettings = {
  game: GameId;
  startLevel: number;
  speed: SpeedId;
  lives: 1 | 3 | 5;
  particles: boolean;
  sound: boolean;
  night: boolean;
};

export const SPEED_MULT: Record<SpeedId, number> = {
  slow: 0.72,
  normal: 1,
  fast: 1.38,
  insane: 1.82,
};

export const GAME_IDS: GameId[] = [
  "run",
  "catch",
  "smash",
  "type",
  "snake",
  "stack",
];

export const DEFAULT_SETTINGS: PlaySettings = {
  game: "run",
  startLevel: 1,
  speed: "normal",
  lives: 3,
  particles: true,
  sound: false,
  night: false,
};

const KEY = "aevion-error-play";

export function loadSettings(): PlaySettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<PlaySettings>;
    return {
      game: GAME_IDS.includes(parsed.game as GameId)
        ? (parsed.game as GameId)
        : "run",
      startLevel: Math.min(9, Math.max(1, Number(parsed.startLevel) || 1)),
      speed: parsed.speed && parsed.speed in SPEED_MULT ? parsed.speed : "normal",
      lives: parsed.lives === 1 || parsed.lives === 5 ? parsed.lives : 3,
      particles: parsed.particles !== false,
      sound: Boolean(parsed.sound),
      night: Boolean(parsed.night),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: PlaySettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export type GameViewProps = {
  settings: PlaySettings;
  ink: string;
  paper: string;
  autoStart?: boolean;
};

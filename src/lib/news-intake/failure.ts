/**
 * Why a page could not be read — and therefore whether asking again is worth
 * anything.
 *
 * The enricher used to record one outcome for every failure: `unavailable`.
 * That collapsed two very different things. A 404 is a finished answer and no
 * amount of asking will change it; a timeout is a coin toss we lost, and the
 * same page usually reads fine an hour later. Measured over a sample of 45
 * stored failures, 20 of them (44%) were readable on a plain re-check, while
 * 6 were permanently gone and 16 were deliberate blocks. Treating all three
 * alike meant the recoverable 44% were written off on the first miss.
 *
 * So the extractor now says which kind of failure it hit, and the enricher
 * decides what to do with it. `kind` is the whole point of this module; the
 * message is only for the desk to read.
 */

export type FailureKind =
  /** Timeout, connection reset, 429, 5xx. The page may well read next time. */
  | "transient"
  /** 401/403/451 — the publisher is refusing us on purpose. */
  | "blocked"
  /** 404/410 — the article is gone. */
  | "gone"
  /** A subscription wall. Not ours to get past. */
  | "paywalled"
  /** Fetched fine, but there was no article in it. Re-asking changes nothing. */
  | "unreadable";

/** Kinds where asking again later is worth a fetch. */
const RETRYABLE = new Set<FailureKind>(["transient"]);

export function isRetryable(kind: FailureKind): boolean {
  return RETRYABLE.has(kind);
}

export class ExtractFailure extends Error {
  readonly kind: FailureKind;
  readonly status?: number;

  constructor(message: string, kind: FailureKind, status?: number) {
    super(message);
    this.name = "ExtractFailure";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * The kind behind any thrown value.
 *
 * Anything that is not an `ExtractFailure` came from somewhere we do not
 * control — a parser blowing up, a bug of ours — and is treated as
 * `unreadable` rather than retried. Retrying an error we cannot explain just
 * spends the budget twice to reach the same place.
 */
export function failureKind(err: unknown): FailureKind {
  return err instanceof ExtractFailure ? err.kind : "unreadable";
}

/** Classify an HTTP response status into a failure kind. */
export function kindForStatus(status: number): FailureKind {
  if (status === 401 || status === 403 || status === 451) return "blocked";
  if (status === 404 || status === 410) return "gone";
  if (status === 429 || status >= 500) return "transient";
  return "unreadable";
}

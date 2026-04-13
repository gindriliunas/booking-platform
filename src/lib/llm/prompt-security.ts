/**
 * Prompt-injection defenses for LLM integrations (SOC2 CC6.1).
 *
 * - Keep system instructions separate from untrusted text; prefer structured chat roles.
 * - Validate and delimit user-provided segments before they are concatenated into prompts.
 */

export const LLM_USER_CONTENT_BEGIN =
  "=== BEGIN USER-PROVIDED CONTENT (untrusted) ===";
export const LLM_USER_CONTENT_END =
  "=== END USER-PROVIDED CONTENT (untrusted) ===";

const DEFAULT_MAX_USER_SEGMENT_LENGTH = 32_000;

/** Chat-style tokens and instruction overrides commonly used in injection attempts */
const INJECTION_PATTERN_SOURCES: string[] = [
  String.raw`ignore\s+(all\s+)?(previous|prior)\s+(instructions?|prompts?|rules?)`,
  String.raw`disregard\s+(the\s+)?(above|prior|previous)`,
  String.raw`ignore\s+(the\s+)?(above|prior|previous)`,
  String.raw`forget\s+(everything|all)\s+(above|prior|previous)`,
  String.raw`(?:^|[\n\r])\s*new\s+instructions?\s*:`,
  String.raw`(?:^|[\n\r])\s*new\s+system\s*:`,
  String.raw`override\s+(the\s+)?(system|instructions?|rules?)`,
  String.raw`<\|im_(start|end)\|`,
  String.raw`\[/INST\]`,
  String.raw`\[INST\]`,
  String.raw`<<\s*SYS\s*>>`,
  String.raw`<<\s*\/\s*SYS\s*>>`,
  String.raw`<\|system\|>`,
  String.raw`<\|assistant\|>`,
  String.raw`<\|user\|>`,
  String.raw`<\|endoftext\|>`,
  String.raw`###\s*system\b`,
  String.raw`###\s*assistant\b`,
  String.raw`<\s*system[\s/>]`,
  String.raw`<\s*\/\s*system\s*>`,
  // Markdown "system" code fence at line start
  String.raw`(?:^|[\n\r])\s*` + "```" + String.raw`\s*system\b`,
];

const PLACEHOLDER_RE = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

function stripControlChars(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Removes trivial control characters and normalizes newlines. Does not enforce length.
 */
export function sanitizeUserPromptSegment(raw: string): string {
  const withoutNulls = stripControlChars(raw);
  return withoutNulls.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function detectPromptInjectionAttempt(text: string): string | null {
  for (let i = 0; i < INJECTION_PATTERN_SOURCES.length; i++) {
    if (new RegExp(INJECTION_PATTERN_SOURCES[i], "i").test(text)) {
      return `content matches a blocked prompt-injection pattern (${i + 1})`;
    }
  }
  return null;
}

export type UserPromptValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Validates and sanitizes a single untrusted segment intended for LLM context
 * (e.g. questionnaire answers, pasted client notes).
 */
export function validateUserPromptSegmentForLlm(
  raw: string,
  options?: { maxLength?: number }
): UserPromptValidationResult {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_USER_SEGMENT_LENGTH;
  if (raw.length > maxLength) {
    return {
      ok: false,
      error: `content exceeds maximum length of ${maxLength} characters`,
    };
  }

  const sanitized = sanitizeUserPromptSegment(raw);

  if (sanitized.includes(LLM_USER_CONTENT_END)) {
    return {
      ok: false,
      error: "content must not contain the end-of-user delimiter sequence",
    };
  }

  const injection = detectPromptInjectionAttempt(sanitized);
  if (injection) {
    return { ok: false, error: injection };
  }

  return { ok: true, value: sanitized };
}

/**
 * Wraps already-validated user text with clear delimiters for single-string prompt APIs.
 * Run {@link validateUserPromptSegmentForLlm} first.
 */
export function wrapValidatedUserContentForPrompt(validatedUserText: string): string {
  return `${LLM_USER_CONTENT_BEGIN}\n${validatedUserText}\n${LLM_USER_CONTENT_END}`;
}

export type LlmChatRole = "system" | "user" | "assistant";

export interface LlmChatMessage {
  role: LlmChatRole;
  content: string;
}

export interface UserContentSection {
  /** Short label for the model, e.g. "Questionnaire answer" */
  label: string;
  text: string;
}

/**
 * Preferred shape for chat APIs: system instructions are never concatenated with user data
 * in the same message.
 */
export function buildLlmChatMessages(input: {
  systemInstructions: string;
  userSections: UserContentSection[];
}): LlmChatMessage[] {
  const userBody = input.userSections
    .map((section) => {
      const v = validateUserPromptSegmentForLlm(section.text);
      if (!v.ok) {
        throw new Error(
          `Invalid user section ${JSON.stringify(section.label)}: ${v.error}`
        );
      }
      const wrapped = wrapValidatedUserContentForPrompt(v.value);
      return `## ${section.label}\n${wrapped}`;
    })
    .join("\n\n");

  return [
    { role: "system", content: input.systemInstructions },
    { role: "user", content: userBody },
  ];
}

/**
 * Strict template fill: only `{{PLACEHOLDER}}` tokens (uppercase snake case) are substituted.
 * Every placeholder in the template must appear in `values`; every value is validated.
 */
export function fillLlmPromptTemplate(
  template: string,
  values: Record<string, string>
): string {
  const namesInTemplate = new Set<string>();
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(template)) !== null) {
    namesInTemplate.add(m[1]);
  }

  const keys = Object.keys(values);
  if (namesInTemplate.size === 0) {
    if (keys.length > 0) {
      throw new Error(
        "Template contains no {{PLACEHOLDER}} tokens but values were provided"
      );
    }
    return template;
  }

  for (const name of namesInTemplate) {
    if (values[name] === undefined) {
      throw new Error(`Missing template value for placeholder {{${name}}}`);
    }
  }

  for (const k of keys) {
    if (!namesInTemplate.has(k)) {
      throw new Error(`Unused template value: ${k}`);
    }
  }

  return template.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (_match, name: string) => {
    const raw = values[name];
    const v = validateUserPromptSegmentForLlm(raw);
    if (!v.ok) {
      throw new Error(`Invalid value for {{${name}}}: ${v.error}`);
    }
    return wrapValidatedUserContentForPrompt(v.value);
  });
}

export function validateQuestionnaireAnswerValues(
  answers: { questionId: string; value: string | null | undefined }[]
): { ok: true } | { ok: false; error: string; questionId?: string } {
  for (const a of answers) {
    if (a.value == null || a.value === "") continue;
    const v = validateUserPromptSegmentForLlm(a.value);
    if (!v.ok) {
      return { ok: false, error: v.error, questionId: a.questionId };
    }
  }
  return { ok: true };
}

/** Validates questionnaire answers and returns sanitized strings for persistence / LLM use. */
export function normalizeQuestionnaireAnswersForLlm(
  answers: { questionId: string; value: string | null | undefined }[]
):
  | { ok: true; answers: { questionId: string; value: string | null }[] }
  | { ok: false; error: string; questionId?: string } {
  const out: { questionId: string; value: string | null }[] = [];
  for (const a of answers) {
    if (a.value == null || a.value === "") {
      out.push({ questionId: a.questionId, value: null });
      continue;
    }
    const v = validateUserPromptSegmentForLlm(a.value);
    if (!v.ok) {
      return { ok: false, error: v.error, questionId: a.questionId };
    }
    out.push({ questionId: a.questionId, value: v.value });
  }
  return { ok: true, answers: out };
}

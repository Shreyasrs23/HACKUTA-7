// src/lib/nlp.ts
import { FormAnalysis, UserAnswers } from "@/types/formTypes";

type Extractor = (text: string) => string | number | undefined;

const patterns: Record<string, Extractor> = {
  "full-name": (t) => {
    const m = t.match(/\b(?:my name is|i am|i'm)\s+([a-z][a-z\s'-]{1,})\b/i);
    return m?.[1]?.trim();
  },
  ssn: (t) => {
    const m = t.match(/\b(\d{3}-\d{2}-\d{4})\b/);
    return m?.[1];
  },
  "date-of-birth": (t) => {
    const m = t.match(/\b(?:born on|dob[:\s])\s*(\d{4}-\d{2}-\d{2}|\d{2}[\/-]\d{2}[\/-]\d{4})\b/i);
    if (!m) return undefined;
    const v = m[1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const [mm, dd, yyyy] = v.split(/[\/\-]/);
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  },
  email: (t) => {
    const m = t.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    return m?.[0];
  },
  "household-size": (t) => {
    const m = t.match(/\b(?:household (?:size|is)|we are|people in (?:my|our) home)\s*(\d{1,2})\b/i);
    return m ? Number(m[1]) : undefined;
  },
  dependents: (t) => {
    const m = t.match(/\b(?:dependents?|kids?|children)\s*(\d{1,2})\b/i);
    return m ? Number(m[1]) : undefined;
  },
  "marital-status": (t) => {
    const m = t.match(/\b(single|married|divorced|widowed|separated)\b/i);
    return m?.[1]?.toLowerCase();
  },
  "employment-status": (t) => {
    const m = t.match(/\b(self[-\s]?employed|unemployed|employed|retired|disabled|student)\b/i);
    return m?.[1]?.toLowerCase().replace(/\s+/g, "-");
  },
  "monthly-income": (t) => {
    const m = t.match(/\b(?:income|earn|make)\s*\$?([\d,.]+)/i);
    return m ? Number(m[1].replace(/[,]/g, "")) : undefined;
  },
  "monthly-expenses": (t) => {
    const m = t.match(/\b(?:expenses|spend|pay)\s*\$?([\d,.]+)/i);
    return m ? Number(m[1].replace(/[,]/g, "")) : undefined;
  },
};

function findFieldIdByKey(analysis: FormAnalysis, key: string): string | undefined {
  const byId = analysis.sections.flatMap((s) => s.fields).find((f) => f.id === key);
  if (byId) return byId.id;
  const byName = analysis.sections
    .flatMap((s) => s.fields)
    .find((f) => f.formField === key || f.mapping.formField === key);
  if (byName) return byName.id;
  // fuzzy by includes
  const byIncludes = analysis.sections
    .flatMap((s) => s.fields)
    .find((f) => f.mapping.formField.toLowerCase().includes(key.replace(/-/g, "_")));
  return byIncludes?.id;
}

export function extractAnswersFromText(
  text: string,
  analysis: FormAnalysis
): Partial<UserAnswers> {
  const t = text.trim();
  if (!t) return {};
  const result: Partial<UserAnswers> = {};
  for (const [key, extractor] of Object.entries(patterns)) {
    const value = extractor(t);
    if (value === undefined || value === "") continue;
    const fieldId = findFieldIdByKey(analysis, key);
    if (fieldId) result[fieldId] = value as any;
  }
  return result;
}

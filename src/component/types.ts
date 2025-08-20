export type Card = {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  instanceId?: string; // ✅ 新增：用于强制 re-mount
};
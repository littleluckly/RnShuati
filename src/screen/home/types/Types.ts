export interface QuestionType {
  id?: number | string;
  name: string;
  value: string
}
export type QuestionTypeViewModel = QuestionType & { selected?: boolean }
export type SkinType = 'dry' | 'oily' | 'combination' | 'normal';

export interface QuizAnswers {
  [key: string]: string;
}

interface SkinResult {
  skinType: SkinType;
  advice: string;
}

export function determineSkinTypeAndAdvice(answersRaw: QuizAnswers | Map<string, string>): SkinResult {
  const answers: QuizAnswers =
    answersRaw instanceof Map ? Object.fromEntries(answersRaw) : answersRaw;

  const yes = (q: string): boolean => {
    const value = (answers[q] ?? '').toLowerCase();
    return value === 'ja' || value === 'yes';
  };

  const scores: Record<SkinType, number> = {
    oily: 0,
    dry: 0,
    normal: 0,
    combination: 0,
  };

  if (yes('q1')) scores.oily++;
  if (yes('q3')) scores.oily++;
  if (yes('q6')) scores.oily++;

  if (yes('q2')) scores.dry++;
  if (yes('q5')) scores.dry++;
  if (yes('q9')) scores.dry++;

  if (yes('q7')) scores.normal++;
  if (yes('q10')) scores.normal++;

  if (scores.oily >= 1 && scores.dry >= 1) {
    scores.combination += 2;
  }

  const max = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));
  const skinType = max[0] as SkinType;

  const adviceTexts: Record<SkinType, string> = {
    dry: 'Your skin needs deep hydration and gentle care.',
    oily: 'Your skin produces excess oil—use lightweight, mattifying products.',
    combination: 'Your skin has both oily and dry areas—focus on balanced, targeted care.',
    normal: 'Your skin is balanced—gentle daily care is usually enough.',
  };

  const advice = adviceTexts[skinType];

  return { skinType, advice };
}

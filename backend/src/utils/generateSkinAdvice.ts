export type SkinType = 'dry' | 'oily' | 'combination' | 'normal';

export function generateSkinAdvice(skinType: SkinType): string {
  const adviceTexts: Record<SkinType, string> = {
    dry: 'Your skin needs deep hydration and gentle care.',
    oily: 'Your skin produces excess oil—use lightweight, mattifying products.',
    combination: 'Your skin has both oily and dry areas—focus on balanced, targeted care.',
    normal: 'Your skin is balanced—gentle daily care is usually enough.',
  };

  return adviceTexts[skinType] ?? 'Skincare advice is not available.';
}

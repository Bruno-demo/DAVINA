export type SkinType = 'oily' | 'dry' | 'normal' | 'combination';

export function mapSkinType(faceApiValue: number): SkinType {
  const mapping: SkinType[] = ['oily', 'dry', 'normal', 'combination'];
  return mapping[faceApiValue] || 'normal';
}

export function SkinAdviceforSkinAnalyse(skinType: SkinType): string {
  const advices: Record<SkinType, string> = {
    oily: `
Your skin tends to produce excess oil, which can lead to shine, enlarged pores, and occasional blemishes.
To restore balance, we recommend:

- **Lightweight, oil-free moisturizers** that hydrate without feeling greasy.
- **Cleansing gels with oil-regulating ingredients** such as salicylic acid or niacinamide.
- **Mattifying products** that reduce shine without drying out your skin.

Gentle, regular cleansing is key to preventing clogged pores. However, harsh cleansing can stimulate even more oil production.`,

    dry: `
Your skin does not produce enough lipids and may feel tight, show fine dryness lines, or have flaky patches.
To support your skin, we recommend:

- **Rich moisturizers** with ingredients like hyaluronic acid, ceramides, and plant oils.
- **Gentle cleansing milk** without alcohol to avoid stressing the skin barrier.
- **Nourishing masks** that provide intensive hydration.

A consistent, hydrating routine helps strengthen the skin barrier and reduce tightness over time.`,

    combination: `
Your skin shows both oily and dry areas. Often the T-zone (forehead, nose, chin) is shiny, while the cheeks are drier or normal.
We recommend:

- **Balancing products** that hydrate while regulating excess oil.
- **Light gel creams** for the T-zone and richer products for drier areas.
- **Mild cleansing** that doesn't strip the skin while helping prevent blemishes.

The goal is to support balance across different areas without over-treating or neglecting any zone.`,

    normal: `
Your skin is balanced—not too dry or too oily—with an even texture and fine pores.
To maintain this, we recommend:

- **Light hydrating care** with hyaluronic acid and vitamins.
- **Gentle cleansing** to remove dirt and makeup without irritation.
- **Regular sun protection** to help prevent UV-related aging.

Stick to a consistent routine to keep your skin healthy long-term.`
  };

  return advices[skinType] ?? 'No recommendation available.';
}

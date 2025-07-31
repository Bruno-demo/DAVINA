export type SkinType = 'fettig' | 'trocken' | 'normal' | 'misch';

export function mapSkinType(faceApiValue: number): SkinType {
  const mapping: SkinType[] = ['fettig', 'trocken', 'normal', 'misch'];
  return mapping[faceApiValue] || 'normal';
}

export function SkinAdviceforSkinAnalyse(skinType: SkinType): string {
  const advices: Record<SkinType, string> = {
    fettig: `
Ihre Haut neigt zur übermäßigen Talgproduktion, was häufig zu glänzender Haut, erweiterten Poren und gelegentlichen Unreinheiten führen kann. 
Um das Gleichgewicht Ihrer Haut wiederherzustellen, empfehlen wir Ihnen:

- **Leichte, ölfreie Feuchtigkeitscremes**, die hydratisieren ohne zu fetten.
- **Reinigungsgele mit talgregulierenden Inhaltsstoffen** wie Salicylsäure oder Niacinamid.
- **Mattierende Produkte**, die den Glanz reduzieren, ohne Ihre Haut auszutrocknen.

Regelmäßige sanfte Reinigung ist entscheidend, um verstopfte Poren zu verhindern. Aggressive Reinigungsmethoden könnten jedoch die Talgproduktion weiter anregen.`,

    trocken: `
Ihre Haut produziert nicht ausreichend Lipide und neigt dadurch zu Spannungsgefühlen, Trockenheitsfältchen und schuppigen Partien.
Zur Unterstützung Ihrer Haut empfehlen wir:

- **Reichhaltige Feuchtigkeitscremes** mit Inhaltsstoffen wie Hyaluronsäure, Ceramiden und pflanzlichen Ölen.
- **Sanfte Reinigungsmilch** ohne Alkohol, um die Hautbarriere nicht zusätzlich zu strapazieren.
- **Pflegende Masken**, die intensiv Feuchtigkeit spenden.

Eine konsequente, feuchtigkeitsspendende Pflege hilft, die Hautschutzbarriere nachhaltig zu stärken und Spannungsgefühle zu reduzieren.`,

    misch: `
Ihre Haut zeigt sowohl fettige als auch trockene Bereiche. Häufig ist die T-Zone (Stirn, Nase, Kinn) glänzend, während die Wangen eher trocken oder normal erscheinen.
Wir empfehlen:

- **Ausgleichende Pflegeprodukte**, die sowohl Feuchtigkeit spenden als auch überschüssigen Talg regulieren.
- **Leichte Gelcremes** für die T-Zone und nährende Produkte für die trockenen Partien.
- **Milde Reinigung**, die die Haut nicht austrocknet und gleichzeitig Unreinheiten vorbeugt.

Ziel ist es, das Gleichgewicht zwischen den unterschiedlichen Hautpartien zu fördern, ohne einen Bereich zu überpflegen oder zu unterversorgen.`,

    normal: `
Ihre Haut ist ausgeglichen, weder zu trocken noch zu fettig, hat ein ebenmäßiges Hautbild mit feinen Poren.
Um diesen optimalen Zustand zu erhalten, empfehlen wir:

- **Leichte, feuchtigkeitsspendende Pflege** mit Hyaluronsäure und Vitaminen.
- **Sanfte Reinigung**, um Schmutz und Make-up ohne Reizung zu entfernen.
- **Regelmäßiger Sonnenschutz**, um die Hautalterung durch UV-Strahlung vorzubeugen.

Achten Sie auf eine kontinuierliche Pflege-Routine, um Ihre gesunde Hautstruktur langfristig zu bewahren.`
  };

  return advices[skinType] ?? 'Keine Empfehlung verfügbar.';
}

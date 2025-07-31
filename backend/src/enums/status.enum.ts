export enum StatusKorb {
  OFFEN = "Offen",
  BESTELLT = "Bestellt",
  ABGEBROCHEN = "Abgebrochen",
  ABGELAUFEN = "Abgelaufen",
}

export enum StatusProdukt {
  VERFUEGBAR = "Verfuegbar",
  AUSVERKAUFT = "Ausverkauft",
}

export enum StatusPayment {
  AUSSTEHEND = "ausstehend",
  BEZAHLT = "bezahlt",
  FEHLGESCHLAGEN = "fehlgeschlagen",
}

export enum StatusOrder {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});

export function formattaData(iso: string): string {
  return formatoData.format(new Date(`${iso}T12:00:00Z`));
}

/** "18:40" → "PT18M40S" per i dati strutturati VideoObject */
export function durataIso(durata: string): string {
  const [m, s] = durata.split(":").map(Number);
  return `PT${m}M${s}S`;
}

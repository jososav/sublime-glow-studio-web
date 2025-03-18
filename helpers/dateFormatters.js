export function formatDate(dateStr) {
  if (!dateStr) return "Fecha no especificada";
  try {
    // The date is stored in YYYY-MM-DD format
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha inválida";
  }
}

export function formatTime(time) {
  if (!time) return "Hora no especificada";
  return time.slice(0, 5); // Format HH:mm
} 
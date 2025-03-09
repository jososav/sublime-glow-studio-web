const _convertToHours = (hour = "00:00") => {
  const [h, m] = hour.split(":").map(Number);

  return h * 60 + m;
};

const _convertMinutesToHour = (minutes) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");

  return `${h}:${m}`;
};

const _calculateEndDate = (timeString, duration) => {
  const [h, m] = timeString.split(":").map(Number);
  const totalMin = h * 60 + m + duration;
  const newH = Math.floor(totalMin / 60)
    .toString()
    .padStart(2, "0");
  const newM = (totalMin % 60).toString().padStart(2, "0");

  return `${newH}:${newM}`;
};

export const calculateTimeSlots = (
  schedule = [],
  duration = 0,
  appointments = []
) => {
  const slots = [];

  schedule.forEach(({ start, end }) => {
    const minStart = _convertToHours(start);
    const minEnd = _convertToHours(end);

    // Itera cada 30 minutos, pero se asegura de que la cita termine antes de fin
    for (let time = minStart; time <= minEnd - duration; time += 20) {
      // Verificar conflictos con citas existentes
      const conflict = appointments.some((appt) => {
        const apptInicio = _convertToHours(appt.startTime);
        const apptFin = _convertToHours(appt.endTime);
        // Existe conflicto si el intervalo [time, time + duration] se traslapa con [apptInicio, apptFin]
        return time < apptFin && time + duration > apptInicio;
      });
      if (!conflict) {
        slots.push(_convertMinutesToHour(time));
      }
    }
  });

  return slots;
};

export const buildAppointment = (date, userId, service, selectedSlot) => {
  if (!date || !service || !selectedSlot) {
    alert("Faltan datos para crear la cita");
    return;
  }

  // Convertir la fecha a formato ISO (solo la parte de la fecha)
  const dateString = date.toISOString().split("T")[0];

  // Calcular la hora de fin sumando la duración del servicio
  const startTime = selectedSlot; // Ej: "14:00"
  const endTime = _calculateEndDate(startTime, service.durationMinutes);

  // Armar el objeto cita
  return {
    userId,
    endTime,
    startTime,
    date: dateString,
    status: "pending",
    serviceId: service.id,
  };
};

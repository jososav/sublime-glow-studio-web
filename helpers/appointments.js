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

const _formatDate = (date) => {
  if (!date) {
    throw new Error('La fecha es requerida');
  }

  try {
    let targetDate;

    // If it's already a Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      targetDate = date;
    }
    // If it's a string
    else if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        targetDate = new Date(year, month - 1, day);
      } else {
        // Try to parse the date string
        targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          throw new Error('Formato de fecha inválido');
        }
      }
    } else {
      throw new Error('Formato de fecha no soportado');
    }

    // Format the date in YYYY-MM-DD format using local timezone
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;

  } catch (error) {
    console.error('Error formatting date:', error);
    throw new Error('Error al formatear la fecha. Por favor, selecciona una fecha válida.');
  }
};

export const calculateTimeSlots = (
  workSchedule,
  serviceDuration,
  existingAppointments = []
) => {
  // Validate inputs
  if (!workSchedule || !serviceDuration) return [];
  if (!Array.isArray(workSchedule)) return [];
  
  const slots = [];
  
  // Process each time slot in the work schedule
  for (const timeSlot of workSchedule) {
    if (!timeSlot.start || !timeSlot.end) continue;
    
    // Convert schedule times to minutes for this slot
    const startTime = _convertToHours(timeSlot.start);
    const endTime = _convertToHours(timeSlot.end);
    
    if (startTime >= endTime) continue;

    // Filter appointments to only consider those that affect availability
    const blockedAppointments = existingAppointments.filter(
      app => ["confirmed", "pending", "finalized"].includes(app.status)
    );

    // Generate slots for this time period
    for (let time = startTime; time <= endTime - serviceDuration; time += 30) {
      let isAvailable = true;
      const timeStr = _convertMinutesToHour(time);
      const endTimeStr = _convertMinutesToHour(time + serviceDuration);

      // Check if the time slot overlaps with any existing appointment
      for (const appointment of blockedAppointments) {
        const appointmentStart = _convertToHours(appointment.startTime);
        const appointmentEnd = _convertToHours(appointment.endTime);

        // Check if there's an overlap
        if (
          (time >= appointmentStart && time < appointmentEnd) || // Start during another appointment
          (time + serviceDuration > appointmentStart && time + serviceDuration <= appointmentEnd) || // End during another appointment
          (time <= appointmentStart && time + serviceDuration >= appointmentEnd) // Completely contain another appointment
        ) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        slots.push(timeStr);
      }
    }
  }

  // Sort slots chronologically
  return slots.sort((a, b) => _convertToHours(a) - _convertToHours(b));
};

export const buildAppointment = ({
  userId,
  firstName,
  lastName,
  email,
  phone,
  date,
  startTime,
  service,
  notes,
  status,
  serviceId,
  durationMinutes
}) => {
  if (!userId) throw new Error('El usuario es requerido');
  if (!startTime) throw new Error('La hora es requerida');
  if (!service) throw new Error('El servicio es requerido');
  if (!serviceId) throw new Error('El ID del servicio es requerido');
  if (!durationMinutes) throw new Error('La duración es requerida');

  return {
    userId,
    firstName,
    lastName,
    email,
    phone,
    date: _formatDate(date),
    startTime,
    service,
    notes: notes || '',
    status: status || 'pending',
    serviceId,
    durationMinutes,
    createdAt: new Date().toISOString()
  };
};

export const convertTimeToMinutes = (timeString) => {
  return _convertToHours(timeString);
};

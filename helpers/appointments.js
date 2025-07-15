const _convertToHours = (timeString) => {
  const [h, m] = timeString.split(":").map(Number);
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
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      app => ["confirmed", "pending"].includes(app.status)
    ).map(app => ({
      ...app,
      startMinutes: _convertToHours(app.startTime),
      endMinutes: _convertToHours(app.startTime) + (app.durationMinutes || serviceDuration)
    }));

    console.log('Blocked appointments:', blockedAppointments.map(app => ({
      start: app.startTime,
      end: _convertMinutesToHour(app.endMinutes),
      status: app.status
    })));

    // Generate slots for this time period
    for (let time = startTime; time <= endTime - serviceDuration; time += 30) {
      let isAvailable = true;
      const slotEndTime = time + serviceDuration;

      // Check if the time slot overlaps with any existing appointment
      for (const appointment of blockedAppointments) {
        // Check for overlap
        const hasOverlap = (
          (time >= appointment.startMinutes && time < appointment.endMinutes) || // Start during another appointment
          (slotEndTime > appointment.startMinutes && slotEndTime <= appointment.endMinutes) || // End during another appointment
          (time <= appointment.startMinutes && slotEndTime >= appointment.endMinutes) // Completely contain another appointment
        );

        if (hasOverlap) {
          console.log('Overlap found:', {
            proposedSlot: {
              start: _convertMinutesToHour(time),
              end: _convertMinutesToHour(slotEndTime)
            },
            existingAppointment: {
              start: appointment.startTime,
              end: _convertMinutesToHour(appointment.endMinutes)
            }
          });
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        slots.push(_convertMinutesToHour(time));
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
  durationMinutes,
  couponId,
  couponAssignmentId,
  discountPercentage,
  servicePrice
}) => {
  if (!userId) throw new Error('El cliente es requerido');
  if (!startTime) throw new Error('La hora es requerida');
  if (!service) throw new Error('El servicio es requerido');
  if (!serviceId) throw new Error('El ID del servicio es requerido');
  if (!durationMinutes) throw new Error('La duración es requerida');
  if (typeof servicePrice !== 'number') throw new Error('El precio del servicio es requerido');

  const appointment = {
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
    servicePrice,
    createdAt: new Date().toISOString()
  };

  // Add coupon information if provided
  if (couponId) {
    appointment.couponId = couponId;
    appointment.couponAssignmentId = couponAssignmentId;
    appointment.discountPercentage = discountPercentage;
    // Calculate final price after discount
    appointment.finalPrice = servicePrice * (1 - (discountPercentage / 100));
  } else {
    appointment.finalPrice = servicePrice;
  }

  return appointment;
};

export const convertTimeToMinutes = (timeString) => {
  return _convertToHours(timeString);
};

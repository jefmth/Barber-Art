function toIsoDate(yearValue, monthValue, dayValue) {
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return '';
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function normalizeAppointmentDate(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1_000_000_000) {
    const milliseconds = value < 100_000_000_000 ? value * 1000 : value;
    const date = new Date(milliseconds);
    if (!Number.isNaN(date.getTime())) {
      return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
  }

  const text = String(value ?? '').trim();
  if (!text) return '';

  const numericTimestamp = text.match(/^\d{10,13}$/);
  if (numericTimestamp) return normalizeAppointmentDate(Number(text));

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s_])/);
  if (isoMatch) return toIsoDate(isoMatch[1], isoMatch[2], isoMatch[3]);

  const localizedMatch = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})(?:$|\s)/);
  if (localizedMatch) return toIsoDate(localizedMatch[3], localizedMatch[2], localizedMatch[1]);

  return '';
}

export function appointmentDateKey(appointment = {}) {
  const candidates = [appointment.data, appointment.dataAgendamento, appointment.data_agendamento, appointment.date];
  for (const candidate of candidates) {
    const normalized = normalizeAppointmentDate(candidate);
    if (normalized) return normalized;
  }
  const combinedDate = String(appointment.data_horario || appointment.dataHorario || '').split('_')[0];
  return normalizeAppointmentDate(combinedDate);
}

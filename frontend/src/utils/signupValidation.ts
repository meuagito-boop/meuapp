export const normalizeBirthDateInput = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const parseBirthDateToIso = (value: string): string | null => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValidDate) {
    return null;
  }

  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

export const isAtLeast18 = (isoDate: string): boolean => {
  const birthDate = new Date(`${isoDate}T00:00:00.000Z`);
  const today = new Date();

  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age -= 1;
  }

  return age >= 18;
};

export type ParsedName = {
  firstName: string;
  lastName: string;
  fullName: string;
};

export const parseName = (value: string): ParsedName | null => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const firstName = parts[0].trim();
  const lastName = parts.slice(1).join(' ').trim();

  if (firstName.length < 2 || lastName.length < 2) {
    return null;
  }

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
};

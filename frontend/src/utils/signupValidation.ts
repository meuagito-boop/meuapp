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

export const DEFAULT_MINIMUM_SIGNUP_AGE = 18;

const MINIMUM_SIGNUP_AGE_BY_COUNTRY_CODE: Record<string, number> = {
  BR: 18,
  US: 18,
};

export const resolveMinimumSignupAge = (countryCode?: string | null): number => {
  if (!countryCode) {
    return DEFAULT_MINIMUM_SIGNUP_AGE;
  }

  return MINIMUM_SIGNUP_AGE_BY_COUNTRY_CODE[countryCode.trim().toUpperCase()] ??
    DEFAULT_MINIMUM_SIGNUP_AGE;
};

export const calculateAge = (isoDate: string, referenceDate = new Date()): number | null => {
  const birthDate = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  let age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = referenceDate.getUTCMonth() - birthDate.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  return age;
};

export const isAtLeastMinimumAge = (isoDate: string, minimumAge: number): boolean => {
  const age = calculateAge(isoDate);
  return age !== null && age >= minimumAge;
};

export const isAtLeast18 = (isoDate: string): boolean => {
  return isAtLeastMinimumAge(isoDate, 18);
};

export const parseBirthDatePartsToIso = (
  day: string,
  month: string,
  year: string,
): string | null => {
  if (!day || !month || !year) {
    return null;
  }

  const normalized = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  return parseBirthDateToIso(normalized);
};

export const isAllowedSignupAge = (
  isoDate: string,
  countryCode?: string | null,
): boolean => {
  return isAtLeastMinimumAge(isoDate, resolveMinimumSignupAge(countryCode));
};

export type ParsedName = {
  firstName: string;
  lastName: string;
  fullName: string;
};

const DISALLOWED_NAME_TOKENS = new Set([
  'admin',
  'adm',
  'anonimo',
  'anonymous',
  'apelido',
  'asdf',
  'fake',
  'fulano',
  'meuagito',
  'name',
  'nickname',
  'nome',
  'null',
  'qwerty',
  'sobrenome',
  'teste',
  'test',
  'usuario',
  'user',
]);

export type NameValidationResult = {
  valid: boolean;
  value: string;
  error?: string;
};

const normalizeNamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[’`]/g, "'");

export const validateNamePart = (
  value: string,
  label: 'nome' | 'sobrenome',
): NameValidationResult => {
  const normalized = normalizeNamePart(value);
  const friendlyLabel = label === 'nome' ? 'nome' : 'sobrenome';

  if (normalized.length < 2) {
    return {
      valid: false,
      value: normalized,
      error: `Informe um ${friendlyLabel} válido.`,
    };
  }

  if (!/^[\p{L}][\p{L}' -]*$/u.test(normalized)) {
    return {
      valid: false,
      value: normalized,
      error: `Use apenas letras no ${friendlyLabel}.`,
    };
  }

  const compact = normalized.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tokens = compact.split(/[\s'-]+/).filter(Boolean);

  if (
    tokens.some((token) => DISALLOWED_NAME_TOKENS.has(token)) ||
    /(.)\1{3,}/.test(compact.replace(/\s/g, ''))
  ) {
    return {
      valid: false,
      value: normalized,
      error: `Informe seu ${friendlyLabel} real.`,
    };
  }

  return {
    valid: true,
    value: normalized,
  };
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

  const firstNameValidation = validateNamePart(firstName, 'nome');
  const lastNameValidation = validateNamePart(lastName, 'sobrenome');

  if (!firstNameValidation.valid || !lastNameValidation.valid) {
    return null;
  }

  return {
    firstName: firstNameValidation.value,
    lastName: lastNameValidation.value,
    fullName: `${firstNameValidation.value} ${lastNameValidation.value}`,
  };
};

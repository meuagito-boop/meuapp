import {
  isAllowedSignupAge,
  isAtLeast18,
  normalizeBirthDateInput,
  parseBirthDatePartsToIso,
  parseBirthDateToIso,
  parseName,
  resolveMinimumSignupAge,
  validateNamePart,
} from './signupValidation';

const formatIsoDate = (date: Date): string => {
  const yyyy = String(date.getUTCFullYear()).padStart(4, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

describe('signupValidation', () => {
  it('normaliza data digitada para DD/MM/AAAA', () => {
    expect(normalizeBirthDateInput('01021999')).toBe('01/02/1999');
    expect(normalizeBirthDateInput('01a02b1999')).toBe('01/02/1999');
    expect(normalizeBirthDateInput('123456789')).toBe('12/34/5678');
  });

  it('converte data valida para ISO', () => {
    expect(parseBirthDateToIso('05/11/1998')).toBe('1998-11-05');
    expect(parseBirthDateToIso('29/02/2024')).toBe('2024-02-29');
  });

  it('converte dia mes e ano separados para ISO', () => {
    expect(parseBirthDatePartsToIso('5', '11', '1998')).toBe('1998-11-05');
    expect(parseBirthDatePartsToIso('31', '02', '2024')).toBeNull();
  });

  it('retorna null para data invalida', () => {
    expect(parseBirthDateToIso('31/02/2024')).toBeNull();
    expect(parseBirthDateToIso('2024-02-20')).toBeNull();
  });

  it('faz parse de nome completo', () => {
    expect(parseName('Ana Maria')).toEqual({
      firstName: 'Ana',
      lastName: 'Maria',
      fullName: 'Ana Maria',
    });

    expect(parseName('Jo')).toBeNull();
    expect(parseName('A B')).toBeNull();
  });

  it('valida partes de nome contra apelidos e placeholders', () => {
    expect(validateNamePart('Ana', 'nome')).toEqual({
      valid: true,
      value: 'Ana',
    });

    expect(validateNamePart('Teste', 'nome').valid).toBe(false);
    expect(validateNamePart('A1', 'sobrenome').valid).toBe(false);
  });

  it('valida maioridade (18+)', () => {
    const today = new Date();

    const adultDate = new Date(
      Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate(),
      ),
    );

    const minorDate = new Date(
      Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate() + 1,
      ),
    );

    expect(isAtLeast18(formatIsoDate(adultDate))).toBe(true);
    expect(isAtLeast18(formatIsoDate(minorDate))).toBe(false);
  });

  it('resolve idade minima por pais para cadastro', () => {
    const today = new Date();
    const minorDate = new Date(
      Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate() + 1,
      ),
    );

    expect(resolveMinimumSignupAge('BR')).toBe(18);
    expect(resolveMinimumSignupAge('ZZ')).toBe(18);
    expect(isAllowedSignupAge(formatIsoDate(minorDate), 'BR')).toBe(false);
  });
});

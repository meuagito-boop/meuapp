type OpeningSlot = {
  opensAt?: string;
  closesAt?: string;
};

const DAY_KEYS: Record<number, string[]> = {
  0: ['sunday', 'domingo'],
  1: ['monday', 'segunda', 'segunda-feira'],
  2: ['tuesday', 'terca', 'terça', 'terca-feira', 'terça-feira'],
  3: ['wednesday', 'quarta', 'quarta-feira'],
  4: ['thursday', 'quinta', 'quinta-feira'],
  5: ['friday', 'sexta', 'sexta-feira'],
  6: ['saturday', 'sabado', 'sábado'],
};

function parseTime(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function resolveSlots(openingHours: unknown, now: Date): OpeningSlot[] {
  if (!openingHours || typeof openingHours !== 'object' || Array.isArray(openingHours)) {
    return [];
  }

  const record = openingHours as Record<string, unknown>;
  const dayKeys = DAY_KEYS[now.getDay()] ?? [];

  for (const key of dayKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as OpeningSlot[];
    }
  }

  return [];
}

export function isOpenNow(openingHours: unknown, now: Date = new Date()): boolean | null {
  if (!openingHours || typeof openingHours !== 'object' || Array.isArray(openingHours)) {
    return null;
  }

  const slots = resolveSlots(openingHours, now);
  if (slots.length === 0) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.some((slot) => {
    const opensAt = parseTime(slot.opensAt);
    const closesAt = parseTime(slot.closesAt);

    if (opensAt == null || closesAt == null) {
      return false;
    }

    if (closesAt >= opensAt) {
      return currentMinutes >= opensAt && currentMinutes <= closesAt;
    }

    return currentMinutes >= opensAt || currentMinutes <= closesAt;
  });
}

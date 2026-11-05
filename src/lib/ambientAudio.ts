// Ambient Audio disabled per user request

export function playAmbientSound(_type: 'rain' | 'waves' | 'alpha' | 'whitenoise' | string): void {
  // Silent
}

export function stopAmbientSound(): void {
  // Silent
}

export function getActiveAmbientSound(): string | null {
  return null;
}

export function setAmbientVolume(_volume: number): void {
  // Silent
}

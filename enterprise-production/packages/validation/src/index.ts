export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSeatLeaseRequest(workstationId: string, seats: string[]): ValidationResult {
  const errors: string[] = [];
  if (!workstationId) errors.push('Workstation ID is required');
  if (!seats || !Array.isArray(seats) || seats.length === 0) errors.push('At least one seat must be selected');
  return { valid: errors.length === 0, errors };
}

export function validateBranchOnboard(name: string, city: string, screens: number): ValidationResult {
  const errors: string[] = [];
  if (!name || name.trim().length < 2) errors.push('Branch name must be at least 2 characters');
  if (!city || city.trim().length < 2) errors.push('City is required');
  if (!screens || screens < 1) errors.push('At least 1 screen is required');
  return { valid: errors.length === 0, errors };
}

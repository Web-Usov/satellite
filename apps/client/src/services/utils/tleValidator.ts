export interface TLEValidationResult {
  valid: boolean;
  error?: string;
  satelliteNumber?: string;
  title?: string;
}

export interface TLELineValidationResult {
  valid: boolean;
  error?: string;
  satelliteNumber?: string;
}

function calculateChecksum(line: string): number {
  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    } else if (char === '-') {
      sum += 1;
    }
  }
  return sum % 10;
}

export function prepareTLELine(line: string): string {
  let prepared = line.trim();
  
  if (prepared.length < 69) {
    prepared = prepared.padEnd(69, ' ');
  } else if (prepared.length > 69) {
    prepared = prepared.substring(0, 69);
  }
  
  return prepared;
}

export function validateTLELine(line: string, lineNumber: 1 | 2): TLELineValidationResult {
  const prepared = prepareTLELine(line);
  
  if (prepared.length !== 69) {
    return { 
      valid: false, 
      error: `Строка ${lineNumber}: неверная длина (должна быть 69 символов)` 
    };
  }
  
  if (prepared.charAt(0) !== lineNumber.toString()) {
    return { 
      valid: false, 
      error: `Строка ${lineNumber}: должна начинаться с "${lineNumber}"` 
    };
  }
  
  const checksumCalculated = calculateChecksum(prepared.substring(0, 68));
  const checksumExpected = parseInt(prepared.charAt(68), 10);
  
  if (isNaN(checksumExpected)) {
    return { 
      valid: false, 
      error: `Строка ${lineNumber}: последний символ должен быть контрольной суммой (цифра)` 
    };
  }
  
  if (checksumCalculated !== checksumExpected) {
    return { 
      valid: false, 
      error: `Строка ${lineNumber}: неверная контрольная сумма (ожидалась ${checksumCalculated}, получена ${checksumExpected})` 
    };
  }
  
  const satelliteNumber = prepared.substring(2, 7).trim();
  
  if (!/^\d+$/.test(satelliteNumber)) {
    return { 
      valid: false, 
      error: `Строка ${lineNumber}: некорректный номер спутника` 
    };
  }
  
  return { 
    valid: true, 
    satelliteNumber 
  };
}

export function validateTLE(tleString: string): TLEValidationResult {
  const lines = tleString.trim().split(/\r?\n/);
  const hasTitle = lines.length === 3;
  
  if (lines.length < 2) {
    return { valid: false, error: 'TLE должен содержать минимум 2 строки' };
  }
  
  if (lines.length > 3) {
    return { valid: false, error: 'TLE должен содержать максимум 3 строки (заголовок + 2 строки данных)' };
  }
  
  const line1Raw = hasTitle ? lines[1] : lines[0];
  const line2Raw = hasTitle ? lines[2] : lines[1];
  const title = hasTitle ? lines[0].trim() : undefined;
  
  if (hasTitle && lines[0].length > 24) {
    return { valid: false, error: 'Заголовок не должен превышать 24 символа' };
  }
  
  const line1 = prepareTLELine(line1Raw);
  const line2 = prepareTLELine(line2Raw);
  
  const validation1 = validateTLELine(line1, 1);
  if (!validation1.valid) {
    return { valid: false, error: validation1.error };
  }
  
  const validation2 = validateTLELine(line2, 2);
  if (!validation2.valid) {
    return { valid: false, error: validation2.error };
  }
  
  const satNum1 = validation1.satelliteNumber;
  const satNum2 = validation2.satelliteNumber;
  
  if (satNum1 !== satNum2) {
    return { 
      valid: false, 
      error: `Номера спутника не совпадают (строка 1: ${satNum1}, строка 2: ${satNum2})` 
    };
  }
  
  return { 
    valid: true, 
    satelliteNumber: satNum1,
    title 
  };
}

export function validateTLEPair(line1: string, line2: string): { 
  isValid: boolean; 
  error?: string;
  satelliteNumber?: string;
  preparedLine1?: string;
  preparedLine2?: string;
} {
  const trimmedLine1 = line1.trim();
  const trimmedLine2 = line2.trim();

  if (!trimmedLine1 || !trimmedLine2) {
    return { 
      isValid: false, 
      error: 'Обе строки TLE обязательны' 
    };
  }

  const preparedLine1 = prepareTLELine(trimmedLine1);
  const preparedLine2 = prepareTLELine(trimmedLine2);

  const validation1 = validateTLELine(preparedLine1, 1);
  if (!validation1.valid) {
    return { 
      isValid: false, 
      error: validation1.error 
    };
  }

  const validation2 = validateTLELine(preparedLine2, 2);
  if (!validation2.valid) {
    return { 
      isValid: false, 
      error: validation2.error 
    };
  }

  const satNum1 = validation1.satelliteNumber;
  const satNum2 = validation2.satelliteNumber;

  if (satNum1 !== satNum2) {
    return { 
      isValid: false, 
      error: `Номера спутника не совпадают (строка 1: ${satNum1}, строка 2: ${satNum2})` 
    };
  }
  
  return {
    isValid: true,
    satelliteNumber: satNum1,
    preparedLine1,
    preparedLine2
  };
}

export function formatTLEForDisplay(line: string): string {
  return line.trim();
}


// IMEI and SIM helpers for the GPS devices demo.

// Luhn check digit for the first 14 digits of an IMEI.
export const imeiCheckDigit = (first14) => {
  const sum = first14.split('').reduce((acc, char, index) => {
    let digit = Number(char);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    return acc + digit;
  }, 0);
  return (10 - (sum % 10)) % 10;
};

export const isValidImei = (value) =>
  /^\d{15}$/.test(value || '') && imeiCheckDigit(value.slice(0, 14)) === Number(value[14]);

export const isValidIccid = (value) => /^89\d{17,18}$/.test(value || '');

export const DEVICE_STATUS = {
  active: { label: 'Reportando', color: 'success' },
  silent: { label: 'Sin señal', color: 'error' },
  stock: { label: 'En almacén', color: 'info' },
  fault: { label: 'Con falla', color: 'warning' },
};

export const DEVICE_MODELS = ['Teltonika FMC130', 'Queclink GV300', 'Suntech ST4340', 'Concox AT4'];

export const SIM_CARRIERS = ['Telcel', 'AT&T', 'Movistar'];

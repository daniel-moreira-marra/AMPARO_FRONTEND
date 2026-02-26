export function maskPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}


export function maskCEP(value: string) {
  let digits = value.replace(/\D/g, "");

  digits = digits.slice(0, 8);

  if (digits.length <= 5) return digits;

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
export interface ViaCepResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function fetchAddressByCep(maskedCep: string): Promise<ViaCepResult | null> {
  const digits = maskedCep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error('Erro ao consultar ViaCEP');

  const data = await res.json();
  if (data.erro) return null;

  return data as ViaCepResult;
}

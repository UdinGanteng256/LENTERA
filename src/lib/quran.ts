export interface Surat {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekkah' | 'Madinah';
  arti: string;
  deskripsi: string;
  audioFull: {
    [key: string]: string;
  };
}

export interface QuranResponse {
  code: number;
  message: string;
  data: Surat[];
}

/**
 * Fetch all surah data from equran.id API
 */
export async function getSurahList(): Promise<Surat[]> {
  const response = await fetch('https://equran.id/api/v2/surat');
  const data: QuranResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`Failed to fetch surah list: ${data.message}`);
  }

  return data.data;
}

/**
 * Fetch a specific surah by its number
 */
export async function getSurah(nomor: number): Promise<Surat | null> {
  const surahList = await getSurahList();
  return surahList.find((s) => s.nomor === nomor) || null;
}

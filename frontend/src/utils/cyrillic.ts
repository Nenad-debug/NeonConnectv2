/**
 * Helper function to convert Cyrillic to Latin characters
 */
export const convertCyrillicToLatin = (text: string): string => {
  if (!text) return text

  const cyrillicToLatin: Record<string, string> = {
    ћ: 'ć', Ћ: 'Ć',
    đ: 'd', Đ: 'D',
    ж: 'z', Ж: 'Z',
    ч: 'č', Ч: 'Č',
    ш: 'š', Ш: 'Š',
    ј: 'j', Ј: 'J',
    њ: 'nj', Њ: 'Nj',
    љ: 'lj', Љ: 'Lj',
    а: 'a', А: 'A',
    е: 'e', Е: 'E',
    и: 'i', И: 'I',
    о: 'o', О: 'O',
    у: 'u', У: 'U',
    ы: 'i', Ы: 'I',
  }

  return text.split('').map((char) => cyrillicToLatin[char] || char).join('')
}

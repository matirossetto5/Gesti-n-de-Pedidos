export const getNumericalValue = (str: string): number[] => {
  const match = str.match(/^(\d+(\.\d+)*)/);
  if (!match) return [Infinity];
  return match[1].split('.').map(Number);
};

export const compareNumericalStrings = (a: string, b: string): number => {
  const aVal = getNumericalValue(a);
  const bVal = getNumericalValue(b);
  
  for (let i = 0; i < Math.max(aVal.length, bVal.length); i++) {
    const aNum = aVal[i] ?? 0;
    const bNum = bVal[i] ?? 0;
    if (aNum !== bNum) return aNum - bNum;
  }
  return 0;
};

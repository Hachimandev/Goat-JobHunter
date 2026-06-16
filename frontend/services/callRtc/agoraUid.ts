export const computeAgoraUid = (accountId: number, sessionId: number, channelName: string): number | null => {
  if (accountId <= 0 || sessionId <= 0 || !channelName.trim()) {
    return null;
  }

  const seed = `${sessionId}:${accountId}:${channelName}`;
  const hash = javaObjectsHash(seed);
  const modulus = 2_147_483_646;

  return floorMod(hash, modulus) + 1;
};

const javaObjectsHash = (value: string): number => {
  return toInt32(31 + javaStringHash(value));
};

const javaStringHash = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = toInt32(31 * hash + value.charCodeAt(index));
  }

  return hash;
};

const floorMod = (value: number, divisor: number): number => {
  return ((value % divisor) + divisor) % divisor;
};

const toInt32 = (value: number): number => {
  return value | 0;
};

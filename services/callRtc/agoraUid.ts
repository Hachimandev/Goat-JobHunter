/**
 * Computes a deterministic Agora UID that matches the Java backend hash.
 * Backend formula: floorMod(Objects.hash(sessionId:accountId:channelName), 2147483646) + 1
 *
 * @returns UID in range [1, 2147483647], or null if inputs are invalid.
 */
export const computeAgoraUid = (
  accountId: number,
  sessionId: number,
  channelName: string,
): number | null => {
  if (accountId <= 0 || sessionId <= 0 || !channelName.trim()) {
    return null;
  }

  const seed = `${sessionId}:${accountId}:${channelName}`;
  const hash = javaObjectsHash(seed);
  const modulus = 2_147_483_646;

  return floorMod(hash, modulus) + 1;
};

/**
 * Replicates Java's Objects.hash(Object...) for a single String argument.
 * Objects.hash(x) = 31 + x.hashCode()  (for single arg)
 */
const javaObjectsHash = (value: string): number => {
  return toInt32(31 + javaStringHash(value));
};

/**
 * Replicates Java's String.hashCode().
 */
const javaStringHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = toInt32(31 * hash + value.charCodeAt(index));
  }
  return hash;
};

/**
 * Replicates Java's Math.floorMod(a, b).
 */
const floorMod = (value: number, divisor: number): number => {
  return ((value % divisor) + divisor) % divisor;
};

/**
 * Simulates Java int32 overflow.
 */
const toInt32 = (value: number): number => {
  return value | 0;
};

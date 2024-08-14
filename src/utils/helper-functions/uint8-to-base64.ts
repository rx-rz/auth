export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string =>
  Buffer.from(uint8Array).toString('base64');

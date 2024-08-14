export const base64ToUint8Array = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, 'base64'));

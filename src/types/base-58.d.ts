declare module 'base-58' {
  export function encode(buffer: Buffer | Uint8Array): string;
  export function decode(str: string): Uint8Array;
}

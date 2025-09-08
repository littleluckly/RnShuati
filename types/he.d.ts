declare module 'he' {
  interface EncodeOptions {
    useNamedReferences?: boolean;
    decimal?: boolean;
    useHexadecimal?: boolean;
    lowercaseHex?: boolean;
  }

  interface DecodeOptions {
    isAttributeValue?: boolean;
    strict?: boolean;
  }

  export function encode(text: string, options?: EncodeOptions): string;
  export function decode(html: string, options?: DecodeOptions): string;
  export function escape(text: string): string;
  export function unescape(html: string, options?: DecodeOptions): string;
}
/**
 * Value Object representing a cryptographic signature for a vote
 * Used to verify the authenticity of a vote on the blockchain
 */
export class VoteSignature {
  private readonly _value: string;
  private readonly _format: SignatureFormat;

  private constructor(value: string, format: SignatureFormat) {
    this._value = value;
    this._format = format;
  }

  /**
   * Create a vote signature from a raw signature string
   */
  static create(
    signature: string,
    format: SignatureFormat = SignatureFormat.ETH,
  ): VoteSignature {
    if (!signature) {
      throw new Error('Signature value is required');
    }

    const trimmed = signature.trim();

    if (!this.isValidFormat(trimmed, format)) {
      throw new Error(`Invalid signature format for ${format}`);
    }

    return new VoteSignature(trimmed, format);
  }

  /**
   * Create from optional signature (returns null if empty)
   */
  static createOptional(signature?: string): VoteSignature | null {
    if (!signature) {
      return null;
    }
    return this.create(signature);
  }

  /**
   * Validate signature format
   */
  private static isValidFormat(
    signature: string,
    format: SignatureFormat,
  ): boolean {
    switch (format) {
      case SignatureFormat.ETH:
        // Ethereum signature: 0x + 130 hex chars (65 bytes)
        return /^0x[0-9a-fA-F]{130}$/.test(signature);
      case SignatureFormat.RAW:
        // Raw signature: at least 64 chars
        return signature.length >= 64;
      default:
        return true;
    }
  }

  get value(): string {
    return this._value;
  }

  get format(): SignatureFormat {
    return this._format;
  }

  /**
   * Check if signature is in Ethereum format
   */
  isEthereumFormat(): boolean {
    return this._format === SignatureFormat.ETH;
  }

  /**
   * Get signature without '0x' prefix
   */
  getWithoutPrefix(): string {
    return this._value.startsWith('0x') ? this._value.slice(2) : this._value;
  }

  equals(other: VoteSignature): boolean {
    if (!other) return false;
    return this._value === other._value && this._format === other._format;
  }

  toString(): string {
    return this._value;
  }
}

export enum SignatureFormat {
  ETH = 'ethereum',
  RAW = 'raw',
}

import { INonceRepository } from '../../domain/repositories/nonce-repository.interface';
import { Nonce } from '../../domain/entities/nonce.entity';

/**
 * Typed mock for INonceRepository
 * Use this in tests and pass it to Nest TestingModule as the value for NONCE_REPOSITORY
 */
export const createNonceRepositoryMock = (): jest.Mocked<INonceRepository> => {
  const mock: jest.Mocked<INonceRepository> = {
    save: jest.fn(),
    findValidNonce: jest.fn(),
    findLatestByWallet: jest.fn(),
    deleteExpired: jest.fn(),
    markAsUsed: jest.fn(),
  } as unknown as jest.Mocked<INonceRepository>;

  // Helper to create a default valid nonce
  const createValidNonce = (walletAddress = '0xabc', nonceValue = 'n1') => {
    const n = Nonce.createForWallet(walletAddress);
    n.nonce = nonceValue;
    // ensure not used and not expired
    n.used = false;
    n.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    return n;
  };

  // Defaults: helpful for many tests — you can override per-test
  mock.save.mockImplementation((n: Nonce) => Promise.resolve(n));
  mock.findValidNonce.mockResolvedValue(null);
  mock.findLatestByWallet.mockResolvedValue(null);
  mock.deleteExpired.mockResolvedValue(0);
  mock.markAsUsed.mockResolvedValue(undefined);

  return Object.assign(mock, { createValidNonce });
};

export type NonceRepositoryMock = ReturnType<typeof createNonceRepositoryMock>;

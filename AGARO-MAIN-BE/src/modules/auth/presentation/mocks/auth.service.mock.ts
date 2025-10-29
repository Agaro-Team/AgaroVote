import { AuthService } from '../../application/services/auth.service';

/**
 * Minimal factory for AuthService mocks used by controller specs.
 * Returns an object with jest.fn() for the methods controllers rely on.
 */
export const createAuthServiceMock = () => {
  const mock = {
    generateNonce: jest.fn(),
    verifySignature: jest.fn(),
    cleanupExpiredNonces: jest.fn(),
  };

  return mock as unknown as jest.Mocked<Partial<AuthService>> & {
    generateNonce: jest.Mock;
    verifySignature: jest.Mock;
    cleanupExpiredNonces: jest.Mock;
  };
};

export type AuthServiceMock = ReturnType<typeof createAuthServiceMock>;

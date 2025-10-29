import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthJwtService } from './jwt.service';
import { NONCE_REPOSITORY } from '../../domain/repositories/nonce-repository.interface';
import { Nonce } from '../../domain/entities/nonce.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createNonceRepositoryMock } from '../../infrastructure/mocks/nonce-repository.mock';
import { SiweMessage } from 'siwe';
import { createAuthJwtServiceMock } from '../mocks/jwt.service.mock';

// Mock SiweMessage class used inside AuthService
jest.mock('siwe', () => ({
  SiweMessage: jest.fn().mockImplementation(() => ({
    nonce: 'mock-nonce',
    // this.verify will be replaced in tests by setting mock implementation
    verify: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockNonceRepo = {
    ...createNonceRepositoryMock(),
    save: jest.fn(),
    findValidNonce: jest.fn(),
    markAsUsed: jest.fn(),
    deleteExpired: jest.fn(),
  };

  const mockJwtService = createAuthJwtServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: NONCE_REPOSITORY,
          useValue: mockNonceRepo,
        },
        {
          provide: AuthJwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('generateNonce', () => {
    it('creates and saves a nonce for the wallet', async () => {
      const wallet = '0xABC';
      const generated = Nonce.createForWallet(wallet);
      mockNonceRepo.save.mockResolvedValue(generated);

      const result = await service.generateNonce(wallet);

      expect(mockNonceRepo.save).toHaveBeenCalled();
      expect(result).toBe(generated);
      expect(result.walletAddress).toBe(wallet);
    });
  });

  describe('verifySignature', () => {
    const rawMessage = 'siwe-message';
    const signature = 'sig';

    it('returns token on successful verification', async () => {
      // Arrange: mock SiweMessage.verify to return success and matching address
      const SiweMessageMock = SiweMessage as unknown as jest.Mock;
      SiweMessageMock.mockImplementation(() => ({
        nonce: 'n1',
        verify: jest
          .fn()
          .mockResolvedValue({ success: true, data: { address: '0xAbC' } }),
      }));

      const nonce = Nonce.createForWallet('0xAbC');
      nonce.nonce = 'n1';
      mockNonceRepo.findValidNonce.mockResolvedValue(nonce);
      mockNonceRepo.markAsUsed.mockResolvedValue(undefined);

      const res = await service.verifySignature(rawMessage, signature, '0xAbC');

      expect(res).toEqual({ accessToken: 'jwt-token', expiresIn: 3600 });
      expect(mockNonceRepo.markAsUsed).toHaveBeenCalledWith('n1');
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith('0xAbC');
    });

    it('throws UnauthorizedException on verification failure', async () => {
      const SiweMessageMock = SiweMessage as unknown as jest.Mock;
      SiweMessageMock.mockImplementation(() => ({
        nonce: 'n1',
        verify: jest.fn().mockResolvedValue({ success: false }),
      }));

      await expect(
        service.verifySignature(rawMessage, signature, '0xabc'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if nonce is missing', async () => {
      const SiweMessageMock = SiweMessage as unknown as jest.Mock;
      SiweMessageMock.mockImplementation(() => ({
        nonce: 'n-missing',
        verify: jest
          .fn()
          .mockResolvedValue({ success: true, data: { address: '0xabc' } }),
      }));

      mockNonceRepo.findValidNonce.mockResolvedValue(null);

      await expect(
        service.verifySignature(rawMessage, signature, '0xabc'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wallet address mismatch', async () => {
      const SiweMessageMock = SiweMessage as unknown as jest.Mock;
      SiweMessageMock.mockImplementation(() => ({
        nonce: 'n1',
        verify: jest
          .fn()
          .mockResolvedValue({ success: true, data: { address: '0xdef' } }),
      }));

      const nonce = Nonce.createForWallet('0xdef');
      nonce.nonce = 'n1';
      mockNonceRepo.findValidNonce.mockResolvedValue(nonce);

      await expect(
        service.verifySignature(rawMessage, signature, '0xabc'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException on SIWE parse errors', async () => {
      // Simulate SiweMessage throwing error with message 'Invalid message'
      const SiweMessageMock = SiweMessage as unknown as jest.Mock;
      SiweMessageMock.mockImplementation(() => {
        throw new Error('Invalid message: malformed');
      });

      await expect(
        service.verifySignature(rawMessage, signature, '0xabc'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateToken', () => {
    it('returns wallet address when token valid', async () => {
      mockJwtService.verifyToken.mockResolvedValue({
        walletAddress: '0xabc',
      });
      const res = await service.validateToken('some-token');
      expect(res).toBe('0xabc');
    });

    it('throws UnauthorizedException when token invalid', async () => {
      mockJwtService.verifyToken.mockRejectedValue(new Error('invalid'));
      await expect(service.validateToken('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('cleanupExpiredNonces', () => {
    it('delegates to repository deleteExpired', async () => {
      mockNonceRepo.deleteExpired.mockResolvedValue(5);
      const res = await service.cleanupExpiredNonces();
      expect(res).toBe(5);
      expect(mockNonceRepo.deleteExpired).toHaveBeenCalled();
    });
  });
});

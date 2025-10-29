import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { createAuthServiceMock } from '../mocks/auth.service.mock';
// NOTE: we avoid importing DTO types here; use plain objects in tests

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = createAuthServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('getNonce', () => {
    it('returns a nonce response dto', async () => {
      const wallet = '0xabc';
      const nonceEntity = {
        nonce: 'n1',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      (mockAuthService.generateNonce as jest.Mock).mockResolvedValue(
        nonceEntity,
      );

      const res = await controller.getNonce({ walletAddress: wallet });

      expect(res.nonce).toBe('n1');
      expect(res.expiresAt).toEqual(nonceEntity.expiresAt);
      expect(mockAuthService.generateNonce as jest.Mock).toHaveBeenCalledWith(
        wallet,
      );
    });
  });

  describe('verifySignature', () => {
    it('returns auth response dto with token and wallet', async () => {
      const dto = {
        walletAddress: '0xabc',
        message: 'm',
        signature: 's',
      };

      (mockAuthService.verifySignature as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        expiresIn: 3600,
      });

      const res = await controller.verifySignature(dto);

      expect(res.accessToken).toBe('token');
      expect(res.walletAddress).toBe(dto.walletAddress);
      expect(res.expiresIn).toBe(3600);
      expect(mockAuthService.verifySignature as jest.Mock).toHaveBeenCalledWith(
        dto.message,
        dto.signature,
        dto.walletAddress,
      );
    });
  });

  describe('cleanupNonces', () => {
    it('returns deletedCount from service', async () => {
      (mockAuthService.cleanupExpiredNonces as jest.Mock).mockResolvedValue(7);

      const res = await controller.cleanupNonces();
      expect(res.deletedCount).toBe(7);
      expect(
        mockAuthService.cleanupExpiredNonces as jest.Mock,
      ).toHaveBeenCalled();
    });
  });
});

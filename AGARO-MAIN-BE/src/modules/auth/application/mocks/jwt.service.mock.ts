export const createAuthJwtServiceMock = () => {
  const mock = {
    verifyToken: jest.fn(),
    decodeToken: jest.fn(),
    getExpiresIn: jest.fn(),
    generateAccessToken: jest.fn(),
  };

  // Defaults
  mock.generateAccessToken.mockReturnValue('jwt-token');
  mock.getExpiresIn.mockReturnValue(3600);
  mock.verifyToken.mockResolvedValue({ walletAddress: '0xAbC' });
  mock.decodeToken.mockReturnValue({ walletAddress: '0xAbC' });

  return mock;
};
export type AuthJwtServiceMock = ReturnType<typeof createAuthJwtServiceMock>;

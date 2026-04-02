import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/authService';
import { UserRepository } from '../../../src/repositories/userRepository';
import { ConflictError, AuthError } from '../../../src/errors/AppError';
import { env } from '../../../src/config/env';

// Mock dependencies
jest.mock('../../../src/repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService (BE-10, BE-11, BE-12)', () => {
  let authService: AuthService;
  let mockPool: Partial<Pool>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    created_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPool = {} as Partial<Pool>;
    mockUserRepository = new UserRepository(mockPool as Pool) as jest.Mocked<UserRepository>;
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    authService = new AuthService(mockPool as Pool);
  });

  describe('signup', () => {
    const signupData = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      name: 'New User',
    };

    test('should create user successfully', async () => {
      // Mock repository to return undefined (user doesn't exist)
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      // Mock bcrypt hash
      const hashedPassword = 'hashed_' + signupData.password;
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock insertUser to return created user
      const createdUser = {
        ...mockUser,
        email: signupData.email,
        name: signupData.name,
        password: hashedPassword,
      };
      mockUserRepository.insertUser.mockResolvedValue(createdUser);

      const result = await authService.signup(signupData.email, signupData.password, signupData.name);

      expect(result).toEqual({
        userId: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      });
    });

    test('should hash password before storing', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      const hashedPassword = 'hashed_' + signupData.password;
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = { ...mockUser, email: signupData.email, password: hashedPassword };
      mockUserRepository.insertUser.mockResolvedValue(createdUser);

      await authService.signup(signupData.email, signupData.password, signupData.name);

      expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, expect.any(Number));
      expect(mockUserRepository.insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
    });

    test('should check if email already exists before creating user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepository.insertUser.mockResolvedValue({ ...mockUser, email: signupData.email });

      await authService.signup(signupData.email, signupData.password, signupData.name);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(signupData.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    });

    test('should throw ConflictError on duplicate email', async () => {
      // Mock repository to return existing user
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        email: signupData.email,
      });

      await expect(
        authService.signup(signupData.email, signupData.password, signupData.name),
      ).rejects.toThrow(ConflictError);

      expect(mockUserRepository.insertUser).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test('should throw ConflictError when insertUser throws 23505 error', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      mockUserRepository.insertUser.mockRejectedValue(duplicateError);

      await expect(
        authService.signup(signupData.email, signupData.password, signupData.name),
      ).rejects.toThrow(ConflictError);
    });

    test('should rethrow non-duplicate database errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const dbError = new Error('Database connection failed');
      mockUserRepository.insertUser.mockRejectedValue(dbError);

      await expect(
        authService.signup(signupData.email, signupData.password, signupData.name),
      ).rejects.toThrow('Database connection failed');
    });

    test('should use bcrypt salt rounds from env', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepository.insertUser.mockResolvedValue({ ...mockUser, email: signupData.email });

      await authService.signup(signupData.email, signupData.password, signupData.name);

      expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, env.BCRYPT_SALT_ROUNDS);
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
    };

    test('should return tokens and user info on valid credentials', async () => {
      // Mock findByEmail to return user
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Mock bcrypt compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock JWT sign
      const mockAccessToken = 'access_token_123';
      const mockRefreshToken = 'refresh_token_456';
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    test('should throw AuthError on invalid email', async () => {
      // Mock findByEmail to return undefined
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow(
        AuthError,
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('should throw AuthError on invalid password', async () => {
      // Mock findByEmail to return user
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Mock bcrypt compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow(
        AuthError,
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('should verify password with bcrypt', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      await authService.login(loginData.email, loginData.password);

      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    test('should generate access token with correct payload', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('access_token');

      await authService.login(loginData.email, loginData.password);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        env.JWT_ACCESS_SECRET,
        expect.objectContaining({ expiresIn: env.JWT_ACCESS_EXPIRES_IN }),
      );
    });

    test('should generate refresh token with correct payload', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      await authService.login(loginData.email, loginData.password);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        expect.objectContaining({ expiresIn: env.JWT_REFRESH_EXPIRES_IN }),
      );
    });

    test('should handle case-sensitive email lookup', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      try {
        await authService.login('TEST@EXAMPLE.COM', loginData.password);
      } catch (error) {
        // Expected to throw AuthError since user doesn't exist
      }

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid_refresh_token';

    test('should return new access token on valid refresh token', async () => {
      // Mock JWT verify to return decoded payload
      const decodedPayload = {
        sub: mockUser.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Mock findById to return user
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Mock JWT sign for new access token
      const newAccessToken = 'new_access_token';
      (jwt.sign as jest.Mock).mockReturnValue(newAccessToken);

      const result = await authService.refreshToken(validRefreshToken);

      expect(result).toEqual({ accessToken: newAccessToken });
    });

    test('should throw AuthError on expired token', async () => {
      // Mock JWT verify to throw TokenExpiredError
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(
        '세션이 만료되었습니다. 다시 로그인해 주세요',
      );
    });

    test('should throw AuthError on invalid token signature', async () => {
      // Mock JWT verify to throw JsonWebTokenError
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid signature');
      });

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(
        '유효하지 않은 토큰입니다',
      );
    });

    test('should throw AuthError on invalid token type', async () => {
      // Mock JWT verify to return payload with wrong type
      const wrongTypePayload = {
        sub: mockUser.id,
        type: 'access', // Wrong type
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      (jwt.verify as jest.Mock).mockReturnValue(wrongTypePayload);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(
        '유효하지 않은 토큰입니다',
      );
    });

    test('should throw AuthError if user no longer exists', async () => {
      // Mock JWT verify to return valid payload
      const decodedPayload = {
        sub: mockUser.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Mock findById to return undefined (user deleted)
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow('사용자를 찾을 수 없습니다');
    });

    test('should verify user exists after token verification', async () => {
      const decodedPayload = {
        sub: mockUser.id,
        type: 'refresh',
      };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new_token');

      await authService.refreshToken(validRefreshToken);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    test('should generate new access token with updated user info', async () => {
      const decodedPayload = {
        sub: mockUser.id,
        type: 'refresh',
      };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new_access_token');

      await authService.refreshToken(validRefreshToken);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        env.JWT_ACCESS_SECRET,
        expect.any(Object),
      );
    });

    test('should handle unknown JWT errors', async () => {
      // Mock JWT verify to throw generic error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown JWT error');
      });

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(
        '토큰 검증에 실패했습니다',
      );
    });
  });

  describe('Token generation helpers', () => {
    test('should generate access token with correct expiration', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      await authService.login('test@example.com', 'password');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.objectContaining({
          expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }),
      );
    });

    test('should generate refresh token with correct expiration', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      await authService.login('test@example.com', 'password');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.objectContaining({
          expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }),
      );
    });
  });

  describe('Error handling edge cases', () => {
    test('should handle bcrypt hash errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(
        authService.signup('test@example.com', 'password', 'name'),
      ).rejects.toThrow('Bcrypt error');
    });

    test('should handle jwt.sign errors in login', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT sign error');
      });

      await expect(authService.login('test@example.com', 'password')).rejects.toThrow(
        'JWT sign error',
      );
    });

    test('should handle jwt.sign errors in refreshToken', async () => {
      const decodedPayload = { sub: mockUser.id, type: 'refresh' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // jwt.sign is called after user verification, so we need to mock the user exists
      // but the error is caught and wrapped in AuthError
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT sign error');
      });

      // The error gets caught and wrapped in AuthError with generic message
      await expect(authService.refreshToken('token')).rejects.toThrow('토큰 검증에 실패했습니다');
    });
  });
});

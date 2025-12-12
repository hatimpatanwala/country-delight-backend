import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { TokensService } from '../tokens/tokens.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private tokensService: TokensService,
  ) {}

  // Customer: Request OTP
  async requestOtp(requestOtpDto: RequestOtpDto) {
    const { phone } = requestOtpDto;
    const otp = await this.otpService.generateAndSave(phone);

    return {
      message: 'OTP sent successfully',
      phone,
      otp, // Remove this in production
    };
  }

  // Customer: Verify OTP & Signup
  async verifyOtpAndSignup(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp, firstName, lastName } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verify(phone, otp);

    // Check if user already exists
    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      // Create new customer
      user = await this.usersService.create({
        phone,
        firstName,
        lastName,
        role: UserRole.CUSTOMER,
      });
    }

    // Verify phone
    await this.usersService.verifyPhone(user['_id'].toString());

    // Update last login
    await this.usersService.updateLastLogin(user['_id'].toString());

    // Generate tokens
    const payload: JwtPayload = {
      sub: user['_id'].toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const tokens = await this.tokensService.generateTokens(payload);

    // Save refresh token
    await this.usersService.updateRefreshToken(user['_id'].toString(), tokens.refreshToken);

    // Cleanup OTP
    await this.otpService.cleanup(phone);

    return {
      user: {
        id: user['_id'],
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Customer/Delivery Boy: Login via Password
  async login(loginDto: LoginDto) {
    const { phone, email, password } = loginDto;

    if (!phone && !email) {
      throw new BadRequestException('Phone or email is required');
    }

    // Find user
    const user = phone
      ? await this.usersService.findByPhone(phone)
      : await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set. Please use OTP login');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    await this.usersService.updateLastLogin(user['_id'].toString());

    // Generate tokens
    const payload: JwtPayload = {
      sub: user['_id'].toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const tokens = await this.tokensService.generateTokens(payload);

    // Save refresh token
    await this.usersService.updateRefreshToken(user['_id'].toString(), tokens.refreshToken);

    return {
      user: {
        id: user['_id'],
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Refresh Token
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.tokensService.verifyRefreshToken(refreshToken);

      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Verify stored refresh token
      if (!user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user['_id'].toString(),
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      const tokens = await this.tokensService.generateTokens(newPayload);

      // Update refresh token
      await this.usersService.updateRefreshToken(user['_id'].toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Delivery Boy: Request OTP
  async requestDeliveryBoyOtp(requestOtpDto: RequestOtpDto) {
    const { phone } = requestOtpDto;

    // Check if delivery boy exists
    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Delivery boy not found. Contact admin.');
    }

    if (user.role !== UserRole.DELIVERY_BOY) {
      throw new UnauthorizedException('This phone number is not registered as a delivery boy');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Contact admin.');
    }

    const otp = await this.otpService.generateAndSave(phone);

    return {
      message: 'OTP sent successfully',
      phone,
      otp, // Remove this in production
    };
  }

  // Delivery Boy: Login via OTP
  async deliveryBoyOtpLogin(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verify(phone, otp);

    // Find delivery boy
    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Delivery boy not found');
    }

    if (user.role !== UserRole.DELIVERY_BOY) {
      throw new UnauthorizedException('This phone number is not registered as a delivery boy');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Contact admin.');
    }

    // Verify phone
    await this.usersService.verifyPhone(user['_id'].toString());

    // Update last login
    await this.usersService.updateLastLogin(user['_id'].toString());

    // Generate tokens
    const payload: JwtPayload = {
      sub: user['_id'].toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const tokens = await this.tokensService.generateTokens(payload);

    // Save refresh token
    await this.usersService.updateRefreshToken(user['_id'].toString(), tokens.refreshToken);

    // Cleanup OTP
    await this.otpService.cleanup(phone);

    return {
      user: {
        id: user['_id'],
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Logout
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}

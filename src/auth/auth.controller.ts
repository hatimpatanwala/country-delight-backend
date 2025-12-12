import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('request-otp')
  @ApiOperation({ summary: 'Request OTP for customer signup/login' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestOtp(requestOtpDto);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and signup/login customer' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  verifyOtpAndSignup(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtpAndSignup(verifyOtpDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with phone/email and password' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('delivery-boy/request-otp')
  @ApiOperation({ summary: 'Request OTP for delivery boy login' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'Delivery boy not found' })
  requestDeliveryBoyOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestDeliveryBoyOtp(requestOtpDto);
  }

  @Public()
  @Post('delivery-boy/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and login delivery boy' })
  @ApiResponse({ status: 200, description: 'Delivery boy authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP or delivery boy not found' })
  deliveryBoyOtpLogin(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.deliveryBoyOtpLogin(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@CurrentUser('sub') userId: string) {
    return this.authService.logout(userId);
  }
}

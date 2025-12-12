import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { CreateDeliveryBoyDto } from './dto/create-delivery-boy.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
  ) {}

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    // Find admin user
    const user = await this.usersService.findByEmail(email);

    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set');
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

  async createDeliveryBoy(createDeliveryBoyDto: CreateDeliveryBoyDto) {
    const deliveryBoy = await this.usersService.create({
      ...createDeliveryBoyDto,
      role: UserRole.DELIVERY_BOY,
    });

    return {
      message: 'Delivery boy created successfully',
      deliveryBoy: {
        id: deliveryBoy['_id'],
        phone: deliveryBoy.phone,
        email: deliveryBoy.email,
        firstName: deliveryBoy.firstName,
        lastName: deliveryBoy.lastName,
        role: deliveryBoy.role,
      },
    };
  }

  async getAllDeliveryBoys() {
    return this.usersService.findByRole(UserRole.DELIVERY_BOY);
  }

  async getAllCustomers() {
    return this.usersService.findByRole(UserRole.CUSTOMER);
  }

  async getAllUsers() {
    return this.usersService.findAll();
  }
}

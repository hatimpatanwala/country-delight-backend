import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateDeliveryBoyDto } from './dto/create-delivery-boy.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.adminService.adminLogin(adminLoginDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Post('delivery-boy')
  @ApiOperation({ summary: 'Create delivery boy (Admin only)' })
  @ApiResponse({ status: 201, description: 'Delivery boy created successfully' })
  createDeliveryBoy(@Body() createDeliveryBoyDto: CreateDeliveryBoyDto) {
    return this.adminService.createDeliveryBoy(createDeliveryBoyDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Get('delivery-boys')
  @ApiOperation({ summary: 'Get all delivery boys (Admin only)' })
  @ApiResponse({ status: 200, description: 'Delivery boys retrieved successfully' })
  getAllDeliveryBoys() {
    return this.adminService.getAllDeliveryBoys();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Get('customers')
  @ApiOperation({ summary: 'Get all customers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  getAllCustomers() {
    return this.adminService.getAllCustomers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }
}

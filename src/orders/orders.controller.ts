import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderStatus } from './schemas/order.schema';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createOrder(@CurrentUser('sub') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getUserOrders(@CurrentUser('sub') userId: string, @Query('status') status?: OrderStatus) {
    return this.ordersService.getUserOrders(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  getOrderById(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.ordersService.getOrderById(userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancelOrder(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(userId, id, reason);
  }

  // Admin routes
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getAllOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.getAllOrders(status);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Assign delivery boy (Admin only)' })
  @ApiResponse({ status: 200, description: 'Delivery boy assigned successfully' })
  assignDeliveryBoy(@Param('id') id: string, @Body('deliveryBoyId') deliveryBoyId: string) {
    return this.ordersService.assignDeliveryBoy(id, deliveryBoyId);
  }
}

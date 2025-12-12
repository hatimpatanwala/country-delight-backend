import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderStatus } from '../orders/schemas/order.schema';

@ApiTags('Delivery')
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DELIVERY_BOY)
@ApiBearerAuth('JWT-auth')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('my-deliveries')
  @ApiOperation({ summary: 'Get assigned deliveries' })
  @ApiResponse({ status: 200, description: 'Deliveries retrieved successfully' })
  getMyDeliveries(@CurrentUser('sub') userId: string, @Query('status') status?: OrderStatus) {
    return this.deliveryService.getMyDeliveries(userId, status);
  }

  @Get('my-deliveries/:id')
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({ status: 200, description: 'Delivery retrieved successfully' })
  getDeliveryById(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.deliveryService.getDeliveryById(userId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update delivery status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateDeliveryStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.deliveryService.updateDeliveryStatus(userId, id, status);
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Mark delivery as delivered' })
  @ApiResponse({ status: 200, description: 'Marked as delivered successfully' })
  markAsDelivered(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.deliveryService.markAsDelivered(userId, id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get delivery history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getDeliveryHistory(@CurrentUser('sub') userId: string) {
    return this.deliveryService.getDeliveryHistory(userId);
  }
}

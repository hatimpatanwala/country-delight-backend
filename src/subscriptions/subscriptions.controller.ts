import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SubscriptionStatus } from './schemas/user-subscription.schema';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Subscription Plans
  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create subscription plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  createPlan(@Body() createPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(createPlanDto);
  }

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  findAllPlans(@Query('productId') productId?: string) {
    return this.subscriptionsService.findAllPlans(productId);
  }

  @Public()
  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOnePlan(@Param('id') id: string) {
    return this.subscriptionsService.findOnePlan(id);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update subscription plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdateSubscriptionPlanDto) {
    return this.subscriptionsService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete subscription plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  removePlan(@Param('id') id: string) {
    return this.subscriptionsService.removePlan(id);
  }

  // User Subscriptions
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  subscribe(@CurrentUser('sub') userId: string, @Body() createSubscriptionDto: CreateUserSubscriptionDto) {
    return this.subscriptionsService.subscribe(userId, createSubscriptionDto);
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  getUserSubscriptions(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.subscriptionsService.getUserSubscriptions(userId, status);
  }

  @Patch(':id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Pause subscription' })
  @ApiResponse({ status: 200, description: 'Subscription paused successfully' })
  pauseSubscription(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('pausedUntil') pausedUntil: Date,
  ) {
    return this.subscriptionsService.pauseSubscription(userId, id, pausedUntil);
  }

  @Patch(':id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resume subscription' })
  @ApiResponse({ status: 200, description: 'Subscription resumed successfully' })
  resumeSubscription(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.subscriptionsService.resumeSubscription(userId, id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  cancelSubscription(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.subscriptionsService.cancelSubscription(userId, id, reason);
  }
}

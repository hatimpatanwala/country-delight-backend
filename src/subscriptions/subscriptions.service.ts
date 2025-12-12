import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';
import { UserSubscription, UserSubscriptionDocument, SubscriptionStatus } from './schemas/user-subscription.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
    @InjectModel(UserSubscription.name) private userSubscriptionModel: Model<UserSubscriptionDocument>,
  ) {}

  // Subscription Plans
  async createPlan(createPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = new this.subscriptionPlanModel(createPlanDto);
    return plan.save();
  }

  async findAllPlans(productId?: string): Promise<SubscriptionPlan[]> {
    const filter: any = { isActive: true };
    if (productId) filter.product = productId;
    return this.subscriptionPlanModel.find(filter).populate('product').exec();
  }

  async findOnePlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanModel.findById(id).populate('product').exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanModel
      .findByIdAndUpdate(id, { $set: updatePlanDto }, { new: true })
      .populate('product')
      .exec();

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async removePlan(id: string): Promise<void> {
    const result = await this.subscriptionPlanModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Subscription plan not found');
    }
  }

  // User Subscriptions
  async subscribe(userId: string, createSubscriptionDto: CreateUserSubscriptionDto): Promise<UserSubscription> {
    const plan = await this.subscriptionPlanModel.findById(createSubscriptionDto.plan).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const startDate = createSubscriptionDto.startDate || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = new this.userSubscriptionModel({
      user: userId,
      plan: createSubscriptionDto.plan,
      deliveryAddress: createSubscriptionDto.deliveryAddress,
      startDate,
      endDate,
      totalAmount: plan.totalPrice,
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription.save();
  }

  async getUserSubscriptions(userId: string, status?: SubscriptionStatus): Promise<UserSubscription[]> {
    const filter: any = { user: userId };
    if (status) filter.status = status;

    return this.userSubscriptionModel
      .find(filter)
      .populate('plan')
      .populate('deliveryAddress')
      .sort({ createdAt: -1 })
      .exec();
  }

  async pauseSubscription(userId: string, subscriptionId: string, pausedUntil: Date): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionModel.findOne({
      _id: subscriptionId,
      user: userId,
    }).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Can only pause active subscriptions');
    }

    subscription.status = SubscriptionStatus.PAUSED;
    subscription.pausedFrom = new Date();
    subscription.pausedUntil = pausedUntil;

    return subscription.save();
  }

  async resumeSubscription(userId: string, subscriptionId: string): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionModel.findOne({
      _id: subscriptionId,
      user: userId,
    }).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Can only resume paused subscriptions');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.pausedFrom = undefined;
    subscription.pausedUntil = undefined;

    return subscription.save();
  }

  async cancelSubscription(userId: string, subscriptionId: string, reason?: string): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionModel.findOne({
      _id: subscriptionId,
      user: userId,
    }).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;

    return subscription.save();
  }
}

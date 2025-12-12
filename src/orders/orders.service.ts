import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  private generateOrderNumber(): string {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product').exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
    }));

    const order = new this.orderModel({
      orderNumber: this.generateOrderNumber(),
      customer: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      deliveryAddress: createOrderDto.deliveryAddress,
      deliveryDate: createOrderDto.deliveryDate,
      notes: createOrderDto.notes,
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
  }

  async getUserOrders(userId: string, status?: OrderStatus): Promise<Order[]> {
    const filter: any = { customer: userId };
    if (status) filter.status = status;

    return this.orderModel
      .find(filter)
      .populate('deliveryAddress')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, customer: userId })
      .populate('deliveryAddress')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, customer: userId }).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Cannot cancel this order');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    return order.save();
  }

  // Admin methods
  async getAllOrders(status?: OrderStatus): Promise<Order[]> {
    const filter: any = {};
    if (status) filter.status = status;

    return this.orderModel
      .find(filter)
      .populate('customer', 'firstName lastName phone email')
      .populate('deliveryAddress')
      .populate('assignedDeliveryBoy', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return order.save();
  }

  async assignDeliveryBoy(orderId: string, deliveryBoyId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.assignedDeliveryBoy = deliveryBoyId as any;
    order.status = OrderStatus.PROCESSING;

    return order.save();
  }
}

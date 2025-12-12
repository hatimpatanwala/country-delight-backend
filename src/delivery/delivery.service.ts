import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';

@Injectable()
export class DeliveryService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async getMyDeliveries(deliveryBoyId: string, status?: OrderStatus): Promise<Order[]> {
    const filter: any = { assignedDeliveryBoy: deliveryBoyId };
    if (status) filter.status = status;

    return this.orderModel
      .find(filter)
      .populate('customer', 'firstName lastName phone')
      .populate('deliveryAddress')
      .populate('items.product')
      .sort({ deliveryDate: 1 })
      .exec();
  }

  async getDeliveryById(deliveryBoyId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, assignedDeliveryBoy: deliveryBoyId })
      .populate('customer', 'firstName lastName phone')
      .populate('deliveryAddress')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    return order;
  }

  async updateDeliveryStatus(
    deliveryBoyId: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, assignedDeliveryBoy: deliveryBoyId })
      .exec();

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return order.save();
  }

  async markAsDelivered(deliveryBoyId: string, orderId: string): Promise<Order> {
    return this.updateDeliveryStatus(deliveryBoyId, orderId, OrderStatus.DELIVERED);
  }

  async getDeliveryHistory(deliveryBoyId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        assignedDeliveryBoy: deliveryBoyId,
        status: OrderStatus.DELIVERED,
      })
      .populate('customer', 'firstName lastName phone')
      .populate('deliveryAddress')
      .sort({ deliveredAt: -1 })
      .exec();
  }
}

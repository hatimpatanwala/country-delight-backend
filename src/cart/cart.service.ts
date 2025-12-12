import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartModel.findOne({ user: userId }).exec();

    if (!cart) {
      cart = new this.cartModel({ user: userId, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    const price = product.discountedPrice || product.price;

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: product._id, quantity, price });
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    return cart.save();
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product').exec();
    if (!cart) {
      return new this.cartModel({ user: userId, items: [], totalAmount: 0 });
    }
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      throw new NotFoundException('Product not in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    return cart.save();
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    return this.updateQuantity(userId, productId, 0);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;

    return cart.save();
  }
}

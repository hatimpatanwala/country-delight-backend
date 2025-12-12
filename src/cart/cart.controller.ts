import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart successfully' })
  addToCart(@CurrentUser('sub') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto.productId, addToCartDto.quantity);
  }

  @Get()
  @ApiOperation({ summary: 'Get cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update item quantity' })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully' })
  updateQuantity(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(userId, productId, quantity);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  removeFromCart(@CurrentUser('sub') userId: string, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  clearCart(@CurrentUser('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }
}

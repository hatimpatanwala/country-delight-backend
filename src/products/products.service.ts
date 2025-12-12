import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);
    const product = new this.productModel({
      ...createProductDto,
      slug,
    });
    return product.save();
  }

  async findAll(categoryId?: string, isFeatured?: boolean): Promise<Product[]> {
    const filter: any = { isActive: true };
    if (categoryId) filter.category = categoryId;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;

    return this.productModel.find(filter).populate('category').sort({ order: 1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({ slug }).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updateData: any = { ...updateProductDto };
    if (updateProductDto.name) {
      updateData.slug = this.generateSlug(updateProductDto.name);
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('category')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }
}

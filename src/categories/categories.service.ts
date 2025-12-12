import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);

    // Check if category with same name or slug exists
    const existingCategory = await this.categoryModel.findOne({
      $or: [{ name: createCategoryDto.name }, { slug }],
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });

    return category.save();
  }

  async findAll(isActive?: boolean): Promise<Category[]> {
    const filter = isActive !== undefined ? { isActive } : {};
    return this.categoryModel.find(filter).sort({ order: 1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      updateData.slug = this.generateSlug(updateCategoryDto.name);
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }
}

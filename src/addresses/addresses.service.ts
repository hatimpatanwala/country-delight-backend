import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { isDefault: false });
    }

    const address = new this.addressModel({
      ...createAddressDto,
      user: userId,
    });

    return address.save();
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressModel.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<Address> {
    const address = await this.addressModel.findOne({ _id: id, user: userId }).exec();
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    if (updateAddressDto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await this.addressModel
      .findOneAndUpdate({ _id: id, user: userId }, { $set: updateAddressDto }, { new: true })
      .exec();

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.addressModel.findOneAndDelete({ _id: id, user: userId }).exec();
    if (!result) {
      throw new NotFoundException('Address not found');
    }
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getPrismaClient } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { User } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private prisma = getPrismaClient();

  // Create a user
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
          },   
      });

      console.log(`Created a new user ${user.name} with email ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
      );
    }
  }

  //find all users 
  async findAll():Promise<User[]>{
    try{
      const users = await this.prisma.user.findMany({
          orderBy: { id: 'asc' },
      })
      return users
    }
    catch(error){
      throw new InternalServerErrorException('Failed to find users')
    }
  }

  // Find one user by id
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new InternalServerErrorException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to find user: ${error.message}`);
    }
  }

  // Update user by id
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
      });
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user by id
  async deleteUser(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete user: ${error.message}`);
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await this.prisma.user.update({
        where: { id: data.userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to reset password: ${error.message}`);
    }
  }
}

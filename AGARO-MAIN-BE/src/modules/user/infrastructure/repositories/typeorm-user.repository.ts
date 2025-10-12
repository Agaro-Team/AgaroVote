import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '@modules/user/domain/entities/user.entity';
import { IUserRepository } from '@modules/user/domain/repositories/user-repository.interface';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.repository.find({ where: { status: UserStatus.ACTIVE } });
  }

  async create(entity: Partial<User>): Promise<User> {
    const user = this.repository.create(entity);
    return await this.repository.save(user);
  }

  async update(id: string, entity: Partial<User>): Promise<User> {
    await this.repository.update(id, entity);
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found after update');
    }
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async save(user: User | Partial<User>): Promise<User> {
    return await this.repository.save(user);
  }
}

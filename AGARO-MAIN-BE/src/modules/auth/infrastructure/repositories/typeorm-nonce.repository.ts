import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Nonce } from '../../domain/entities/nonce.entity';
import { INonceRepository } from '../../domain/repositories/nonce-repository.interface';

@Injectable()
export class TypeOrmNonceRepository implements INonceRepository {
  constructor(
    @InjectRepository(Nonce)
    private readonly repository: Repository<Nonce>,
  ) {}

  async save(nonce: Nonce): Promise<Nonce> {
    return this.repository.save(nonce);
  }

  async findValidNonce(nonceValue: string): Promise<Nonce | null> {
    return this.repository.findOne({
      where: {
        nonce: nonceValue,
        used: false,
      },
    });
  }

  async findLatestByWallet(walletAddress: string): Promise<Nonce | null> {
    return this.repository.findOne({
      where: {
        walletAddress: walletAddress.toLowerCase(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  async markAsUsed(nonceValue: string): Promise<void> {
    await this.repository.update({ nonce: nonceValue }, { used: true });
  }
}

import { BaseService } from '../base.service';
import { AdaptiveCardMessage, AdaptiveCardMessageType } from '../../types/models';

export class AdaptiveCardMessageService extends BaseService {
  constructor() {
    super('adaptiveCardMessage');
  }

  async findAll(): Promise<AdaptiveCardMessage[]> {
    return this.prisma.adaptiveCardMessage.findMany({
      include: {
        user: true
      }
    });
  }

  async findByType(type: AdaptiveCardMessageType): Promise<AdaptiveCardMessage[]> {
    return this.prisma.adaptiveCardMessage.findMany({
      where: {
        type
      },
      include: {
        user: true
      }
    });
  }

  async create(data: Omit<AdaptiveCardMessage, 'id' | 'created_at'>): Promise<AdaptiveCardMessage> {
    return this.prisma.adaptiveCardMessage.create({
      data,
      include: {
        user: true
      }
    });
  }
}
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { Price } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreatePriceDto, UpdatePriceDto } from './dto';
import { PriceRepository } from './price.repository';

@Injectable()
export class PriceService {
  private logger = new Logger(PriceService.name);
  constructor(private readonly priceRepository: PriceRepository) {}
  async createPrice(createPriceDto: CreatePriceDto): Promise<ResponseData> {
    const { tier, value } = createPriceDto;
    const price: Price = {
      tier,
      value,
    };

    const priceCreate = await this.priceRepository.createPrice(price);

    const responseData: ResponseData = {
      message: 'Create price successfully!',
      data: priceCreate,
    };

    return responseData;
  }

  async updatePrice(
    updatePriceDto: UpdatePriceDto,
    priceID: number,
  ): Promise<ResponseData> {
    const { tier, value } = updatePriceDto;

    const price = await this.priceRepository.getPriceById(priceID);

    if (!price) {
      throw new NotFoundException('Price not found');
    }

    if (tier) {
      const priceByTier = await this.priceRepository.getPriceByTier(tier);

      if (priceByTier && priceByTier.id !== priceID) {
        throw new ConflictException('Tier already exists');
      }
      price.tier = tier;
    }

    if (value) {
      price.value = value;
    }

    await this.priceRepository.save(price);
    const responseData: ResponseData = {
      message: 'Update price successfully!',
      data: price,
    };

    return responseData;
  }

  async deletePrice(priceID: number): Promise<ResponseData> {
    const price = await this.priceRepository.getPriceById(priceID);

    if (!price) {
      throw new NotFoundException('Price not found');
    }

    await this.priceRepository.delete(priceID);

    const responseData: ResponseData = {
      message: 'Delete price successfully!',
    };

    return responseData;
  }

  async getPrices(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder = this.priceRepository.createQueryBuilder('price');
    queryBuilder.orderBy('price.created_at', pageCommonOptionsDto.order);

    queryBuilder.skip(pageCommonOptionsDto.skip).take(pageCommonOptionsDto.size);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageCommonOptionsDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get prices successfully!',
      data,
    };

    return responseData;
  }
}

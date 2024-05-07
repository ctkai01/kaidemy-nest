import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';

export interface Pagination {
  take: number;
  skip: number;

}


export interface PageMetaDtoParameters {
  pageOptionsDto: PageCommonOptionsDto;
  itemCount: number;
}
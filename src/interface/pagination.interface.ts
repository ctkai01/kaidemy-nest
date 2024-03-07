import { PageUserOptionsDto } from 'src/common/paginate/users/page-option.dto';

export interface Pagination {
  take: number;
  skip: number;

}


export interface PageMetaDtoParameters {
  pageOptionsDto: PageUserOptionsDto;
  itemCount: number;
}
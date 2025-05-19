import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ReviewService } from './review.service';

@ApiTags('리뷰 조회')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  getReview(@CurrentUser() userId: bigint) {
    return this.reviewService.getReview(userId);
  }
}

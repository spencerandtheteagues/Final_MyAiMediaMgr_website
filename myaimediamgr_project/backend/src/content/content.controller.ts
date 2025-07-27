import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('generate')
  async generateContent(@Body() body: { theme: string; uid: string; includeImage?: boolean; includeVideo?: boolean }) {
    try {
      const { theme, uid, includeImage = true, includeVideo = false } = body;
      
      if (!theme || !uid) {
        throw new HttpException('Theme and uid are required', HttpStatus.BAD_REQUEST);
      }

      const post = await this.contentService.generatePost(theme, uid, includeImage, includeVideo);
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pending')
  async getPendingContent(@Query('uid') uid: string) {
    try {
      if (!uid) {
        throw new HttpException('uid is required', HttpStatus.BAD_REQUEST);
      }

      const posts = await this.contentService.getPendingPosts(uid);
      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch pending content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/approve')
  async approveContent(
    @Param('id') id: string,
    @Body() body: { uid: string; scheduledTime?: string }
  ) {
    try {
      const { uid, scheduledTime } = body;
      
      if (!uid) {
        throw new HttpException('uid is required', HttpStatus.BAD_REQUEST);
      }

      const scheduledDate = scheduledTime ? new Date(scheduledTime) : undefined;
      const post = await this.contentService.approvePost(id, uid, scheduledDate);
      
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to approve content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reject')
  async rejectContent(
    @Param('id') id: string,
    @Body() body: { uid: string }
  ) {
    try {
      const { uid } = body;
      
      if (!uid) {
        throw new HttpException('uid is required', HttpStatus.BAD_REQUEST);
      }

      await this.contentService.rejectPost(id, uid);
      
      return {
        success: true,
        message: 'Content rejected successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reject content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async getAllContent(@Query('uid') uid: string) {
    try {
      if (!uid) {
        throw new HttpException('uid is required', HttpStatus.BAD_REQUEST);
      }

      const posts = await this.contentService.getAllPosts(uid);
      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


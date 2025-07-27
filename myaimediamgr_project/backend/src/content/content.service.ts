import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { AiService } from '../ai/ai.service';

export interface Post {
  id?: string;
  uid: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  createdAt: Date;
  scheduledTime?: Date;
  theme: string;
}

@Injectable()
export class ContentService {
  private firestore: Firestore;

  constructor(private aiService: AiService) {
    this.firestore = new Firestore({
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
  }

  async generatePost(theme: string, uid: string, includeImage = true, includeVideo = false): Promise<Post> {
    try {
      // Generate AI content
      const text = await this.aiService.generateCaption(theme);
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (includeImage) {
        imageUrl = await this.aiService.generateImage(theme);
      }

      if (includeVideo) {
        videoUrl = await this.aiService.generateVideo(theme);
      }

      // Create post object
      const post: Post = {
        uid,
        text,
        status: 'pending',
        createdAt: new Date(),
        theme,
      };

      // Only add optional fields if they exist
      if (imageUrl) {
        post.imageUrl = imageUrl;
      }
      if (videoUrl) {
        post.videoUrl = videoUrl;
      }

      // Save to Firestore
      const docRef = await this.firestore.collection('posts').add(post);
      post.id = docRef.id;

      return post;
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate post');
    }
  }

  async getPendingPosts(uid: string): Promise<Post[]> {
    try {
      const snapshot = await this.firestore
        .collection('posts')
        .where('uid', '==', uid)
        .where('status', '==', 'pending')
        .get();

      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        scheduledTime: doc.data().scheduledTime?.toDate(),
      })) as Post[];

      // Sort by createdAt in memory
      return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching pending posts:', error);
      throw new Error('Failed to fetch pending posts');
    }
  }

  async approvePost(postId: string, uid: string, scheduledTime?: Date): Promise<Post> {
    try {
      const postRef = this.firestore.collection('posts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data() as Post;
      if (postData.uid !== uid) {
        throw new Error('Unauthorized');
      }

      const updateData: Partial<Post> = {
        status: 'approved',
      };

      if (scheduledTime) {
        updateData.scheduledTime = scheduledTime;
      }

      await postRef.update(updateData);

      return {
        id: postId,
        ...postData,
        ...updateData,
        createdAt: postData.createdAt,
      };
    } catch (error) {
      console.error('Error approving post:', error);
      throw new Error('Failed to approve post');
    }
  }

  async rejectPost(postId: string, uid: string): Promise<void> {
    try {
      const postRef = this.firestore.collection('posts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data() as Post;
      if (postData.uid !== uid) {
        throw new Error('Unauthorized');
      }

      await postRef.update({ status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw new Error('Failed to reject post');
    }
  }

  async getAllPosts(uid: string): Promise<Post[]> {
    try {
      const snapshot = await this.firestore
        .collection('posts')
        .where('uid', '==', uid)
        .get();

      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        scheduledTime: doc.data().scheduledTime?.toDate(),
      })) as Post[];

      // Sort by createdAt in memory
      return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching all posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }
}


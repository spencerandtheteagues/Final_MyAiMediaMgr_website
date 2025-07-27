import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly geminiApiKey = process.env.GEMINI_API_KEY;
  private readonly geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  async generateCaption(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.geminiApiUrl}?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate an engaging social media caption for: ${prompt}. Keep it concise, engaging, and include relevant hashtags.`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      // Fallback response
      return `🚀 Exciting content about ${prompt}! Transform your social media strategy with AI-powered content generation. #AI #SocialMedia #ContentCreation #Innovation`;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // For now, return a placeholder image URL
    // In a full implementation, this would integrate with Imagen or another image generation service
    return `https://via.placeholder.com/400x400/6366f1/ffffff?text=${encodeURIComponent(prompt)}`;
  }

  async generateVideo(prompt: string): Promise<string> {
    // For now, return a placeholder video URL
    // In a full implementation, this would integrate with Veo or another video generation service
    return `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;
  }
}


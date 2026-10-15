import { api } from './api';
import { ApiResponse, Product, SellerPublic } from '../types';

export interface AssistantResponse {
  query: string;
  answer: string;
  topic: string;
  isGrounded: boolean;
  relevantProducts: Product[];
  relevantSellers: SellerPublic[];
  suggestedQueries: string[];
}

export const assistantService = {
  /**
   * Ask the site-grounded HOPEBI AI model a question
   */
  async askQuestion(query: string, sessionId?: string, userName?: string): Promise<AssistantResponse> {
    const res = await api.post<ApiResponse<AssistantResponse>>('/assistant/chat', {
      query,
      sessionId,
      userName
    });
    return res.data.data;
  }
};

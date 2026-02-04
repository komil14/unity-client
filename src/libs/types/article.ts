import { Types } from "mongoose";
import type { MemberData } from "./api";

export type ArticleStatus = "ACTIVE" | "DELETE";

/**
 * Article/Board - Database Document Interface
 */
export interface Article {
  _id: string;
  boardTitle: string;
  boardContent: string;
  boardImage?: string;
  boardStatus: ArticleStatus;
  boardLikes: number;
  boardViews: number;
  memberId: string;
  memberData?: MemberData; // Author information (populated from lookup)
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Article Input DTO - For creating/updating articles
 */
export interface ArticleInput {
  boardTitle: string;
  boardContent: string;
  boardImage?: File | string; // File for upload or string for existing
  boardStatus?: ArticleStatus;
}

/**
 * Article Query Parameters
 */
export interface ArticleInquiry {
  page?: number;
  limit?: number;
  order?: "createdAt" | "boardLikes" | "boardViews" | "boardTitle";
  search?: string;
  memberId?: string; // Filter by author
}

/**
 * Articles List Response
 */
export interface GetArticlesResponse {
  items: Article[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Single Article Response
 */
export interface ArticleDto extends Article {}

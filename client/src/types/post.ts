import { CommentType } from "./comment";

export interface PostType {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: CommentType[];
}

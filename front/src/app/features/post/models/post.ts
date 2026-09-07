import {PostComment} from "./post-comment";

export interface Post {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
  topicName: string;
  comments: PostComment[];
}

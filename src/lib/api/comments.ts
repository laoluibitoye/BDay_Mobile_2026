import { apiRequest } from './client';

export type CommentAuthor = { displayName: string };

export type CommentView = {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  author: CommentAuthor;
  replies: CommentView[];
};

export type CommentsPage = { comments: CommentView[]; nextCursor: string | null };

export type MyCommentView = { id: string; postId: string; body: string; createdAt: string; parentId: string | null };
export type MyCommentsPage = { comments: MyCommentView[]; nextCursor: string | null };

export type CommentNotificationView = {
  id: string;
  postId: string;
  commentBody: string;
  replyAuthor: string;
  createdAt: string;
  read: boolean;
};

export type CreateCommentInput = { postId: string; body: string; parentId?: string; captchaToken?: string };

// Reading is public — no WordPress or auth involvement, matches comments.controller.ts's
// class-level absence of @UseGuards on GET.
export function getComments(postId: string, cursor?: string, limit?: number): Promise<CommentsPage> {
  const params = new URLSearchParams({ postId });
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', String(limit));
  return apiRequest(`/api/v1/comments?${params.toString()}`);
}

// captchaToken is intentionally omitted here: no RN-compatible captcha widget exists yet, and
// CaptchaService.verify() passes any request through unconditionally when the server has no
// RECAPTCHA_SECRET_KEY/TURNSTILE_SECRET_KEY configured (true in every environment this app talks
// to today). If captcha is ever enabled server-side, this call starts failing until a native
// widget is wired up here — a deliberate, documented trade-off, not an oversight.
export function postComment(input: CreateCommentInput): Promise<CommentView> {
  return apiRequest('/api/v1/comments', { method: 'POST', body: JSON.stringify(input) });
}

export function deleteComment(id: string): Promise<{ removed: boolean }> {
  return apiRequest(`/api/v1/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getMyComments(cursor?: string, limit?: number): Promise<MyCommentsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return apiRequest(`/api/v1/comments/mine${qs ? `?${qs}` : ''}`);
}

export function getCommentNotifications(): Promise<CommentNotificationView[]> {
  return apiRequest('/api/v1/comments/notifications');
}

export function markCommentNotificationsRead(): Promise<{ marked: number }> {
  return apiRequest('/api/v1/comments/notifications/read', { method: 'POST' });
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: number;
  content: string;
  author: string;
  created_at: string;
  is_ai?: boolean;
};

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  tags?: string[];
  likes?: number;
  comments: Comment[];
};

type PostDetailViewProps = {
  postId: string;
  initialPost?: Post | null;
  copy: {
    loadFailed: string;
    comment: string;
    like: string;
    replyTitle: string;
    replyPlaceholder: string;
    replySubmit: string;
    replyEmpty: string;
    replyFailed: string;
    noDiscussion: string;
    aiInteractive: string;
  };
};

function simpleMarkdown(input: string): string {
  return input
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}

export function PostDetailView({
  postId,
  initialPost = null,
  copy,
}: PostDetailViewProps) {
  const [post, setPost] = useState<Post | null>(initialPost);
  const [message, setMessage] = useState("");

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error(copy.loadFailed);
      const payload = await response.json();
      setPost(payload.data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : copy.loadFailed);
    }
  }, [copy.loadFailed, postId]);

  useEffect(() => {
    if (!initialPost) {
      void loadPost();
    }
  }, [initialPost, loadPost]);

  async function likePost() {
    const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (response.ok) {
      void loadPost();
    }
  }

  async function submitReply(formData: FormData) {
    const content = String(formData.get("content") || "").trim();
    if (!content) {
      setMessage(copy.replyEmpty);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error(copy.replyFailed);
      setMessage("");
      void loadPost();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : copy.replyFailed);
    }
  }

  if (!post) {
    return <article className="page-card">{message || copy.loadFailed}</article>;
  }

  return (
    <section className="stack">
      <article className="page-card">
        <div className="chip-row">
          {(post.tags || []).map((tag) => (
            <span className="chip" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
        <h1>{post.title}</h1>
        <p className="lead">{post.author}</p>
        <div
          className="markdown-block"
          dangerouslySetInnerHTML={{ __html: simpleMarkdown(post.content) }}
        />
        <div className="hero-actions">
          <button className="btn btn-secondary" onClick={() => void likePost()} type="button">
            {copy.like} ({post.likes || 0})
          </button>
          <a className="btn btn-secondary" href="#reply">
            {copy.comment}
          </a>
        </div>
      </article>

      <article className="page-card">
        <h2>{copy.replyTitle}</h2>
        <div className="stack">
          {post.comments.length === 0 ? (
            <p className="lead">{copy.noDiscussion}</p>
          ) : (
            post.comments.map((comment) => (
              <div className="panel" key={comment.id}>
                <strong>{comment.is_ai ? copy.aiInteractive : comment.author}</strong>
                <p
                  className="lead"
                  dangerouslySetInnerHTML={{
                    __html: simpleMarkdown(comment.content),
                  }}
                />
              </div>
            ))
          )}
        </div>
      </article>

      <form
        action={(formData) => {
          void submitReply(formData);
        }}
        className="page-card stack"
        id="reply"
      >
        <textarea
          className="textarea"
          name="content"
          placeholder={copy.replyPlaceholder}
          rows={6}
        />
        {message ? <p className="message message-error">{message}</p> : null}
        <button className="btn btn-primary" type="submit">
          {copy.replySubmit}
        </button>
      </form>
    </section>
  );
}

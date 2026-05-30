"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  userName: string | null;
  userImage: string | null;
  userHandle?: string | null;
};

/**
 * Like + comment widget on the banner detail page. Optimistic updates so
 * the heart pops the instant the user clicks; the API call reconciles.
 */
export function BannerSocial({
  slug,
  initialLiked,
  initialLikeCount,
  signedIn,
  comments: initialComments,
}: {
  slug: string;
  initialLiked: boolean;
  initialLikeCount: number;
  signedIn: boolean;
  comments: Comment[];
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const toggleLike = async () => {
    if (!signedIn) {
      router.push("/signin");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const r = await fetch("/api/lib/heart", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!r.ok) {
        // Revert optimistic update
        setLiked(!next);
        setLikeCount((c) => c + (next ? -1 : 1));
      }
    } finally {
      setBusy(false);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedIn) {
      router.push("/signin");
      return;
    }
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const r = await fetch("/api/lib/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "add", slug, body }),
      });
      if (r.ok) {
        const created = (await r.json()) as Comment;
        setComments((cs) => [created, ...cs]);
        setDraft("");
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy}
        className={
          "px-6 py-3 rounded-full text-label-md font-label-md flex items-center justify-center gap-2 transition-all border " +
          (liked
            ? "bg-error/15 text-error border-error/40"
            : "glass-panel text-on-surface-variant hover:text-on-surface border-white/10")
        }
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          favorite
        </span>
        {liked ? "Liked" : "Like"} · {likeCount}
      </button>

      <section className="mt-6 flex flex-col gap-3">
        <h2 className="text-label-md font-label-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">comment</span>
          Comments ({comments.length})
        </h2>

        <form onSubmit={postComment} className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              signedIn ? "Say something about this banner…" : "Sign in to comment"
            }
            disabled={!signedIn}
            rows={3}
            className="bg-surface-container-high/60 border border-white/10 rounded-xl px-3 py-2 text-label-sm font-label-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary resize-none disabled:opacity-60"
            maxLength={1500}
          />
          {signedIn ? (
            <button
              type="submit"
              disabled={posting || !draft.trim()}
              className="self-end ai-gradient text-on-primary px-4 py-1.5 rounded-full text-label-sm font-label-sm disabled:opacity-60 transition-all"
            >
              {posting ? "Posting…" : "Post comment"}
            </button>
          ) : (
            <Link
              href="/signin"
              className="self-end glass-panel px-4 py-1.5 rounded-full text-label-sm font-label-sm text-on-surface-variant"
            >
              Sign in
            </Link>
          )}
        </form>

        <div className="flex flex-col gap-3 mt-2">
          {comments.length === 0 ? (
            <p className="text-on-surface-variant text-label-sm font-label-sm text-center py-6">
              No comments yet. Be the first.
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 glass-panel rounded-xl p-3">
                {c.userImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.userImage}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center text-on-primary text-label-sm font-label-sm shrink-0">
                    {(c.userName ?? "?").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/u/${c.userHandle ?? c.userId}`}
                      className="text-on-surface text-label-sm font-label-sm truncate hover:underline"
                    >
                      {c.userName ?? "Anonymous"}
                    </Link>
                    <span className="text-on-surface-variant/60 text-[10px]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-label-sm font-label-sm whitespace-pre-wrap break-words mt-1">
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

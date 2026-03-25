import { useCallback, useEffect, useState } from "react";
import {
  addCommentRequest,
  getPostsRequest,
  likePostRequest,
  unlikePostRequest,
} from "../../api/postsApi";
import { getApiBaseUrl } from "../../api/apiClient";

export default function PostsList({ token, onError, reloadKey }) {
  const API_URL = getApiBaseUrl();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPostsRequest({ token });
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "Failed to load posts.");
      onError?.(e);
    } finally {
      setLoading(false);
    }
  }, [onError, token]);

  useEffect(() => {
    // GET /posts is authenticated (needs JWT).
    if (!token) return;
    void refresh();
  }, [token, reloadKey, refresh]);

  if (!token) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white/70">
        Please sign in to view and create posts.
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-white/70">Loading posts...</div>
      ) : null}

      {!loading && posts.length === 0 ? (
        <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white/70">
          No posts yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <div className="text-sm text-white/70 mt-1">
                  by {p.author?.username ?? "Unknown"}
                </div>
              </div>
              {/* content can be long; keep it readable */}
            </div>
            <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap">
              {p.content}
            </p>

            {Array.isArray(p.media) && p.media.length > 0 ? (
              <div className="mt-4 space-y-3">
                {p.media.map((m, idx) => {
                  if (!m?.url) return null;
                  const fullSrc = `${API_URL}${m.url}`;

                  return m.type === "video" ? (
                    <video
                      key={`${m.url}-${idx}`}
                      src={fullSrc}
                      controls
                      className="w-full rounded-xl bg-black"
                    />
                  ) : (
                    <img
                      key={`${m.url}-${idx}`}
                      src={fullSrc}
                      alt="Post media"
                      className="w-full max-h-96 object-contain rounded-xl bg-black"
                    />
                  );
                })}
              </div>
            ) : null}

            {/* Like row */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const liked = Array.isArray(p.likes) && p.likes.length > 0;
                    if (liked) {
                      await unlikePostRequest({ token, postId: p.id });
                    } else {
                      await likePostRequest({ token, postId: p.id });
                    }
                    await refresh();
                  } catch (e2) {
                    setError(e2?.message ?? "Failed to update like.");
                  }
                }}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  Array.isArray(p.likes) && p.likes.length > 0
                    ? "bg-white text-black border-white/60"
                    : "bg-transparent border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {Array.isArray(p.likes) && p.likes.length > 0 ? "Liked" : "Like"}
              </button>
              <div className="text-sm text-white/70">
                {p._count?.likes ?? 0} likes
              </div>
            </div>

            {/* Comments */}
            <div className="mt-4">
              <div className="text-sm text-white/70 mb-2">
                {p._count?.comments ?? 0} comments
              </div>

              <div className="space-y-3 mb-4">
                {Array.isArray(p.comments) && p.comments.length > 0 ? (
                  p.comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-white/15 bg-black/15 p-3"
                    >
                      <div className="flex items-center gap-2">
                        {c.author?.avatarUrl ? (
                          <img
                            src={`${API_URL}${c.author.avatarUrl}`}
                            alt="avatar"
                            className="w-6 h-6 rounded-full object-cover bg-black"
                          />
                        ) : null}
                        <div className="text-sm font-semibold">
                          {c.author?.username ?? "Unknown"}
                        </div>
                      </div>
                      <div className="text-sm text-white/85 mt-2 whitespace-pre-wrap">
                        {c.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/60">No comments yet.</div>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const draft = (commentDrafts[p.id] ?? "").trim();
                  if (!draft) return;

                  try {
                    await addCommentRequest({
                      token,
                      postId: p.id,
                      content: draft,
                    });
                    setCommentDrafts((prev) => ({ ...prev, [p.id]: "" }));
                    await refresh();
                  } catch (e2) {
                    setError(e2?.message ?? "Failed to add comment.");
                  }
                }}
              >
                <textarea
                  value={commentDrafts[p.id] ?? ""}
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [p.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a comment..."
                  className="w-full min-h-20 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


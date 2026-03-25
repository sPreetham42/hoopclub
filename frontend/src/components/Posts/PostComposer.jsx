import { useEffect, useState } from "react";
import { createPostWithMediaRequest } from "../../api/postsApi";

export default function PostComposer({ token, onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Create preview URLs for selected files.
  // Note: we revoke them when selection changes.
  const revokePreviews = (urls) => {
    for (const u of urls) URL.revokeObjectURL(u);
  };

  const handleMediaChange = (fileList) => {
    const files = Array.from(fileList || []);

    // Build preview URLs for images/videos.
    const nextPreviews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));

    setPreviews(nextPreviews);
    setMediaFiles(files);
  };

  useEffect(() => {
    // Cleanup old preview URLs whenever selection changes/unmounts.
    const urls = previews.map((p) => p.url);
    return () => revokePreviews(urls);
  }, [previews]);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6">
      <h2 className="text-lg font-semibold mb-4">Create a post</h2>

      {!token ? (
        <div className="text-sm text-white/70">Sign in to create posts.</div>
      ) : (
        <>
          {error ? (
            <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);

              if (!title.trim() || !content.trim()) {
                setError("Title and content are required.");
                return;
              }

              setSubmitting(true);
              try {
                await createPostWithMediaRequest({
                  token,
                  title: title.trim(),
                  content: content.trim(),
                  mediaFiles,
                });
                setTitle("");
                setContent("");
                setMediaFiles([]);
                setPreviews([]);
                onCreated?.();
              } catch (e2) {
                setError(e2?.message ?? "Failed to create post.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block text-sm mb-2">Title</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm mb-2">Content</label>
              <textarea
                className="w-full min-h-28 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm mb-2">
                Pictures/videos (optional)
              </label>
              <input
                className="w-full text-sm"
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={submitting}
                onChange={(e) => handleMediaChange(e.target.files)}
              />

              {previews.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {previews.map(({ file, url }, idx) => {
                    const isImage = file.type.startsWith("image/");
                    const key = `${file.name}-${idx}`;

                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-white/20 bg-black/20 p-3"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={file.name}
                            className="max-h-40 w-auto rounded-lg"
                          />
                        ) : (
                          <video
                            src={url}
                            controls
                            className="max-h-40 w-full rounded-lg bg-black"
                          />
                        )}
                        <div className="text-xs text-white/70 mt-2 truncate">
                          {file.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}


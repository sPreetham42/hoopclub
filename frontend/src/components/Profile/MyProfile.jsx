import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../../api/apiClient";

export default function MyProfile({ user, updateProfile }) {
  const API_URL = getApiBaseUrl();

  const [mode, setMode] = useState("view"); // "edit" | "view"
  const [bio, setBio] = useState("");
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setBio(user?.bio ?? "");
    setTeam(user?.team ?? "");
    setPosition(user?.position ?? "");
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
    setError(null);
    setSuccess(null);
    setMode("view");
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const avatarSrc = useMemo(() => {
    if (avatarPreviewUrl) return avatarPreviewUrl;
    if (user?.avatarUrl) return `${API_URL}${user.avatarUrl}`;
    return null;
  }, [API_URL, avatarPreviewUrl, user?.avatarUrl]);

  const handleAvatarChange = (file) => {
    setError(null);
    setSuccess(null);
    setAvatarFile(file || null);

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    if (!file) {
      setAvatarPreviewUrl(null);
      return;
    }

    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-[#141336] text-white">
      <div className="max-w-3xl mx-auto px-6 md:px-16 py-10">
        <h1 className="font-stencil text-4xl mb-2">My Profile</h1>
        <p className="text-sm text-white/70 mb-8">
          Update your info and connect with the community.
        </p>

        <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile avatar"
                  className="w-24 h-24 rounded-full object-cover bg-black"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-xs text-white/60">
                  No photo
                </div>
              )}
              <div className="mt-3 text-xs text-white/70">Profile picture</div>
            </div>

            <div className="flex-1">
              <div className="text-sm text-white/80 mb-2">
                Signed in as{" "}
                <span className="text-white">{user?.email}</span>
              </div>

              {mode === "view" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("edit");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>

          {mode === "view" ? (
            <div>
              {bio ? (
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-1">Bio</div>
                  <div className="text-sm text-white/90 whitespace-pre-wrap">
                    {bio}
                  </div>
                </div>
              ) : null}

              {team ? (
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-1">Team</div>
                  <div className="text-sm text-white/90">{team}</div>
                </div>
              ) : null}

              {position ? (
                <div className="mb-6">
                  <div className="text-sm text-white/70 mb-1">
                    Role / Position
                  </div>
                  <div className="text-sm text-white/90">{position}</div>
                </div>
              ) : null}

              {error ? (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mb-4 rounded-lg border border-green-500/60 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {success}
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-1">
                  <label className="block text-sm text-white/80 mb-2">
                    Upload avatar
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={saving}
                    onChange={(e) =>
                      handleAvatarChange(e.target.files?.[0])
                    }
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mb-4 rounded-lg border border-green-500/60 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {success}
                </div>
              ) : null}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setError(null);
                  setSuccess(null);
                  try {
                    await updateProfile({
                      bio: bio.trim(),
                      team: team.trim(),
                      position: position.trim(),
                      avatarFile,
                    });
                    setSuccess("Profile updated.");
                    setAvatarFile(null);
                    setMode("view");
                  } catch (err) {
                    setError(err?.message ?? "Failed to update profile.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                    className="w-full min-h-28 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                    placeholder="Tell people about you (your goals, what you like to play, etc.)"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Team</label>
                  <input
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                    placeholder="e.g., Hoop Tigers, YMCA, School Team"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm mb-2">Role / Position</label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
                    placeholder="e.g., PG, SG, Coach, Player"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


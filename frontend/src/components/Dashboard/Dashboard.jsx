import { useState } from "react";
import PostsList from "../Posts/PostsList";
import PostComposer from "../Posts/PostComposer";

export default function Dashboard({ user, token }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="min-h-screen bg-[#141336] text-white">
      <div className="max-w-5xl mx-auto px-6 md:px-16 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-stencil text-4xl">Dashboard</h1>
            <div className="text-sm text-white/70 mt-2">
              Signed in as <span className="text-white">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PostComposer
            token={token}
            onCreated={() => setReloadKey((k) => k + 1)}
          />

          <PostsList
            token={token}
            reloadKey={reloadKey}
            onError={() => {
              // Error UI is handled inside PostsList.
            }}
          />
        </div>
      </div>
    </div>
  );
}


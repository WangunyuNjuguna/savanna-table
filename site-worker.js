// site-worker.js - serves the static game (no build, no server code).
// All routes fall through to the uploaded assets; index.html at root.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};

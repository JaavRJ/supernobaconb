export type SpotifyKind = "track" | "album";

export interface SpotifyRef {
  kind: SpotifyKind;
  id: string;
}

/** Reconoce open.spotify.com/{track|album}/{id} (con o sin prefijo intl-xx); null si no */
export function parseSpotify(url: string): SpotifyRef | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "open.spotify.com") return null;
    const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album)\/([A-Za-z0-9]+)/);
    return m ? { kind: m[1] as SpotifyKind, id: m[2] } : null;
  } catch {
    return null;
  }
}

/** Reconoce youtube.com/watch?v=, youtu.be/, /embed/ y /shorts/; devuelve el id o null */
export function parseYouTube(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www\.|m\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.split("/")[1] ?? null;
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
        id = m ? m[1] : null;
      }
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** URL de respaldo solo si es https; si no, null y el enlace no se dibuja */
export function safeHttpsUrl(url: string): string | null {
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

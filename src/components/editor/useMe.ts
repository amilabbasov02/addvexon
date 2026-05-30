"use client";

import { useEffect, useState } from "react";

export type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    image: string | null;
    handle?: string | null;
  };
  limits: {
    canExportWithoutWatermark: boolean;
    canAccessProTemplates: boolean;
    canUseAiText: boolean;
    canUseAiImage: boolean;
    canUploadImages: boolean;
    maxCanvasSizesPerResize: number;
    canUseAnimation: boolean;
    aiCreditsPerMonth: number;
  };
  usage: {
    aiCreditsUsed: number;
    aiCreditsRemaining: number;
    exportsCount: number;
    storageBytes: number;
  };
};

/** Fetch the current user's plan + limits + usage. Null while loading or
 *  when signed out. */
export function useMe(signedIn: boolean): MeResponse | null {
  const [me, setMe] = useState<MeResponse | null>(null);
  useEffect(() => {
    if (!signedIn) {
      setMe(null);
      return;
    }
    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && data.user) setMe(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  return me;
}

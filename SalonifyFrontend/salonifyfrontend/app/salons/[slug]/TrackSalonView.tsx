"use client";

import { useEffect } from "react";
import { trackSalonView } from "@/services/salon";

type Props = {
  salonId: string;
};

export default function TrackSalonView({ salonId }: Props) {
  useEffect(() => {
    async function track() {
      try {
        await trackSalonView(salonId);
      } catch {
        // Tracking je best-effort; profil salona treba da radi i bez njega.
      }
    }

    track();
  }, [salonId]);

  return null;
}

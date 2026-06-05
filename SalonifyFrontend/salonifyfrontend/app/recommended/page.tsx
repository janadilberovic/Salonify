"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalonCard from "../components/SalonCard";
import { EyebrowLabel, LinkButton } from "../components/ui";
import { ChevronRightIcon } from "../components/Icons";
import { useEffect, useRef, useState } from "react";
import {
  getRecommendedSalons,
  RecommendedSalon,
} from "@/services/recommendations";

export default function RecommendedPage() {
  const [recommendations, setRecommendations] = useState<RecommendedSalon[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadSalons() {
      try {
        setLoading(true);
        const data = await getRecommendedSalons();
        setRecommendations(data);
      } catch (error) {
        console.error("Greska pri ucitavanju preporuka:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    loadSalons();
  }, []);

  function scrollRecommendations(direction: "prev" | "next") {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction === "next" ? carousel.clientWidth : -carousel.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] border border-white/80 shadow-softer">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative">
            <EyebrowLabel>Preporuceni za Vas</EyebrowLabel>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.03]">
              Saloni koji ce Vam se{" "}
              <span className="italic text-primary">svideti</span>.
            </h1>

            <p className="mt-4 text-muted max-w-xl">
              Otkrijte salone koji su po Vasem ukusu. Preporuke se prilagodjavaju
              terminima, pretragama i salonima koje gledate.
            </p>

            <div className="mt-6 flex gap-3">
              <LinkButton href="/salons">Svi saloni</LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-10 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted">Ucitavanje preporucenih salona...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
            <h2 className="font-display text-2xl font-semibold">
              Jos nema personalizovanih preporuka.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Pretrazi uslugu, pogledaj salon ili zakazi termin i ovde ce se
              pojaviti saloni preporuceni bas na osnovu tih aktivnosti.
            </p>
            <LinkButton href="/salons" className="mt-6" size="sm">
              Pogledaj salone
            </LinkButton>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Personalizovane preporuke
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Saloni odabrani prema Vasim aktivnostima i interesovanjima.
                </p>
              </div>

              {recommendations.length > 3 && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollRecommendations("prev")}
                    className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white text-foreground shadow-softer transition hover:border-primary/40 hover:text-primary"
                    aria-label="Prethodne preporuke"
                  >
                    <ChevronRightIcon width={18} height={18} className="rotate-180" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollRecommendations("next")}
                    className="grid size-10 place-items-center rounded-full bg-primary text-white shadow-soft transition hover:bg-primary-hover"
                    aria-label="Sledece preporuke"
                  >
                    <ChevronRightIcon width={18} height={18} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.salonId}
                  className="flex min-w-0 shrink-0 basis-full snap-start flex-col gap-3 sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)]"
                >
                  <div className="flex-1">
                    <SalonCard salon={recommendation.salon} featured={false} />
                  </div>
                  <p className="min-h-10 px-1 text-sm leading-5 text-muted">
                    {getRecommendationReason(recommendation)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

function getRecommendationReason(recommendation: RecommendedSalon) {
  const service =
    recommendation.reasonServiceName?.trim().toLowerCase() ||
    recommendation.salon.services.find(
      (item) => String(item.serviceType) === String(recommendation.reasonServiceType)
    )?.name.toLowerCase() ||
    "ovu uslugu";

  switch (recommendation.reasonActivityType) {
    case "AppointmentCreated":
    case "AppointmentCompleted":
    case 3:
    case 4:
      return `Zato sto si vec zakazao/la ${service}.`;
    case "ReviewAdded":
    case 5:
      return `Zato sto si ocenio/la salon za ${service}.`;
    case "ViewService":
    case 2:
      return `Zato sto si gledao/la usluge za ${service}.`;
    case "ViewSalon":
    case 1:
      return `Zato sto ti se dopadaju saloni koji nude ${service}.`;
    case "Search":
    case 0:
      return `Zato sto si pretrazivao/la ${service}.`;
    default:
      return `Preporuceno jer ovaj salon nudi ${service}.`;
  }
}

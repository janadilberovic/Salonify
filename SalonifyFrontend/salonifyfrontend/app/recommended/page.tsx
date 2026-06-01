"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalonCard from "../components/SalonCard";
import { EyebrowLabel, LinkButton } from "../components/ui";
import { useEffect, useState } from "react";
import {
  getRecommendedSalons,
  RecommendedSalon,
} from "@/services/recommendations";
import { mapServiceTypeToSr } from "@/mappers/appointment";

export default function RecommendedPage() {
  const [recommendations, setRecommendations] = useState<RecommendedSalon[]>(
    []
  );
  const [loading, setLoading] = useState(true);

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
          <div className="grid items-stretch sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.salonId}
                className="flex h-full flex-col gap-3"
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
        )}
      </section>

      <Footer />
    </>
  );
}

function getRecommendationReason(recommendation: RecommendedSalon) {
  const service = mapServiceTypeToSr(
    recommendation.reasonServiceType
  ).toLowerCase();

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

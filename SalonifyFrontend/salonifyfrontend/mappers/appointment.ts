

/* =========================
   SERVICE TYPE MAPPER
========================= */

export function mapServiceTypeToSr(value: string | number): string {
  switch (value) {
    case "Haircut":
    case 0:
      return "Šišanje";

    case "Coloring":
    case 1:
      return "Farbanje";

    case "Styling":
    case 2:
      return "Stilizovanje";

    case "Manicure":
    case 3:
      return "Manikir";

    case "Pedicure":
    case 4:
      return "Pedikir";

    case "Makeup":
    case 5:
      return "Šminkanje";

    case "Massage":
    case 6:
      return "Masaža";

    case "Facial":
    case 7:
      return "Tretman lica";

    case "Waxing":
    case 8:
      return "Depilacija";

    case "SpaTreatment":
    case 9:
      return "Spa tretman";

    case "NailArt":
    case 10:
      return "Ukrašavanje noktiju";

    case "Other":
    case 11:
      return "Ostalo";

    default:
      return "Nepoznato";
  }
}

/* =========================
   APPOINTMENT STATUS MAPPER
========================= */

export function mapAppointmentStatusToSr(
  value: string | number
): string {
  switch (value) {
    case "Pending":
    case 0:
      return "Na čekanju";

    case "Approved":
    case 1:
      return "Odobren";

    case "Rejected":
    case 2:
      return "Odbijen";

    case "Cancelled":
    case 3:
      return "Otkazan";

    case "Completed":
    case 4:
      return "Završen";

    default:
      return "Nepoznato";
  }
}
export const AppointmentStatusMap = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Cancelled: 3,
  Completed: 4,
} as const;
export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  image: string;
  category: string;
};

export type Review = {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  body: string;
  service?: string;
  salonId: string;
};

export type Salon = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  cover: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  categories: string[];
  priceLevel: 1 | 2 | 3;
  openingHours: { day: string; hours: string; closed?: boolean }[];
  services: Service[];
};

export type Appointment = {
  id: string;
  salonId: string;
  salonName: string;
  salonCover: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";
  note?: string;
  customer?: { name: string; phone: string; avatar?: string };
};

export const CITIES = [
  "Belgrade",
  "Novi Sad",
  "Niš",
  "Kragujevac",
  "Subotica",
  "Zrenjanin",
];

export const CATEGORIES = [
  "Hair",
  "Nails",
  "Skin & Face",
  "Makeup",
  "Lashes & Brows",
  "Massage",
  "Waxing",
];

const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const SALONS: Salon[] = [
  {
    id: "rose-petal",
    slug: "rose-petal",
    name: "Rose Petal Atelier",
    tagline: "Signature blowouts & couture color",
    description:
      "A calm, light-filled atelier where every visit feels like a ritual. Our stylists are trained in Parisian balayage and Japanese head-spa techniques — bring your inspiration, we will bring the craft.",
    city: "Belgrade",
    address: "Kralja Petra 24, Stari Grad",
    phone: "+381 11 345 6789",
    cover: img("photo-1560066984-138dadb4c035"),
    gallery: [
      img("photo-1560066984-138dadb4c035"),
      img("photo-1522337360788-8b13dee7a37e"),
      img("photo-1580618672591-eb180b1a973f"),
      img("photo-1600948836101-f9ffda59d250"),
    ],
    rating: 4.9,
    reviewCount: 214,
    categories: ["Hair", "Makeup"],
    priceLevel: 3,
    openingHours: [
      { day: "Mon", hours: "10:00 – 20:00" },
      { day: "Tue", hours: "10:00 – 20:00" },
      { day: "Wed", hours: "10:00 – 20:00" },
      { day: "Thu", hours: "10:00 – 21:00" },
      { day: "Fri", hours: "09:00 – 21:00" },
      { day: "Sat", hours: "09:00 – 18:00" },
      { day: "Sun", hours: "Closed", closed: true },
    ],
    services: [
      {
        id: "cut",
        name: "Signature Cut & Style",
        description: "Consultation, precision cut, wash and blowout.",
        price: 55,
        duration: 75,
        image: img("photo-1521590832167-7bcbfaa6381f", 400, 300),
        category: "Hair",
      },
      {
        id: "balayage",
        name: "Parisian Balayage",
        description: "Hand-painted highlights, gloss and finish.",
        price: 140,
        duration: 180,
        image: img("photo-1522337360788-8b13dee7a37e", 400, 300),
        category: "Hair",
      },
      {
        id: "headspa",
        name: "Japanese Head Spa",
        description: "Scalp detox, lymphatic massage and steam mask.",
        price: 65,
        duration: 60,
        image: img("photo-1600334129128-685c5582fd35", 400, 300),
        category: "Hair",
      },
      {
        id: "bridal",
        name: "Bridal Hair & Makeup",
        description: "Trial, on-site styling and touch-up kit.",
        price: 220,
        duration: 180,
        image: img("photo-1522337094846-8a818192de1f", 400, 300),
        category: "Makeup",
      },
    ],
  },
  {
    id: "lilac-and-co",
    slug: "lilac-and-co",
    name: "Lilac & Co.",
    tagline: "Nail couture in a romantic pastel studio",
    description:
      "A boutique nail studio for the detail-obsessed. Gel, hard-gel and chrome. We source non-toxic polishes and keep our tools medically sterilised.",
    city: "Novi Sad",
    address: "Dunavska 15",
    phone: "+381 21 678 1234",
    cover: img("photo-1522337360788-8b13dee7a37e"),
    gallery: [
      img("photo-1604654894610-df63bc536371"),
      img("photo-1607779097040-26e80aa78e66"),
      img("photo-1610992015762-45dca7ba0a56"),
      img("photo-1632345031435-8727f6897d53"),
    ],
    rating: 4.8,
    reviewCount: 162,
    categories: ["Nails"],
    priceLevel: 2,
    openingHours: [
      { day: "Mon", hours: "Closed", closed: true },
      { day: "Tue", hours: "11:00 – 20:00" },
      { day: "Wed", hours: "11:00 – 20:00" },
      { day: "Thu", hours: "11:00 – 20:00" },
      { day: "Fri", hours: "10:00 – 20:00" },
      { day: "Sat", hours: "10:00 – 18:00" },
      { day: "Sun", hours: "12:00 – 17:00" },
    ],
    services: [
      {
        id: "mani",
        name: "Classic Manicure",
        description: "Shape, cuticle, hydrating mask and polish.",
        price: 22,
        duration: 45,
        image: img("photo-1604654894610-df63bc536371", 400, 300),
        category: "Nails",
      },
      {
        id: "gel",
        name: "Gel Overlay",
        description: "Strengthening gel with a glassy finish.",
        price: 32,
        duration: 60,
        image: img("photo-1607779097040-26e80aa78e66", 400, 300),
        category: "Nails",
      },
      {
        id: "art",
        name: "Hand-painted Nail Art",
        description: "Custom design session with our lead artist.",
        price: 48,
        duration: 75,
        image: img("photo-1610992015762-45dca7ba0a56", 400, 300),
        category: "Nails",
      },
    ],
  },
  {
    id: "velvet-bloom",
    slug: "velvet-bloom",
    name: "Velvet Bloom Spa",
    tagline: "Facials, massage & glow rituals",
    description:
      "Clinical skincare with the soul of a spa. Our specialists design bespoke facial protocols using Biologique Recherche and Omorovicza.",
    city: "Belgrade",
    address: "Terazije 3",
    phone: "+381 11 222 3344",
    cover: img("photo-1560750588-73207b1ef5b8"),
    gallery: [
      img("photo-1560750588-73207b1ef5b8"),
      img("photo-1519823551278-64ac92734fb1"),
      img("photo-1540555700478-4be289fbecef"),
    ],
    rating: 4.7,
    reviewCount: 98,
    categories: ["Skin & Face", "Massage"],
    priceLevel: 3,
    openingHours: [
      { day: "Mon", hours: "10:00 – 20:00" },
      { day: "Tue", hours: "10:00 – 20:00" },
      { day: "Wed", hours: "10:00 – 20:00" },
      { day: "Thu", hours: "10:00 – 20:00" },
      { day: "Fri", hours: "10:00 – 21:00" },
      { day: "Sat", hours: "10:00 – 18:00" },
      { day: "Sun", hours: "Closed", closed: true },
    ],
    services: [
      {
        id: "facial",
        name: "Bespoke Signature Facial",
        description: "Diagnostic, deep cleanse, mask and lymphatic massage.",
        price: 95,
        duration: 75,
        image: img("photo-1519823551278-64ac92734fb1", 400, 300),
        category: "Skin & Face",
      },
      {
        id: "peel",
        name: "Radiance Peel",
        description: "Professional acid peel for luminous skin.",
        price: 120,
        duration: 60,
        image: img("photo-1540555700478-4be289fbecef", 400, 300),
        category: "Skin & Face",
      },
      {
        id: "massage",
        name: "Deep Tissue Massage",
        description: "Full-body tension release with warm oils.",
        price: 85,
        duration: 60,
        image: img("photo-1544161515-4ab6ce6db874", 400, 300),
        category: "Massage",
      },
    ],
  },
  {
    id: "ivory-studio",
    slug: "ivory-studio",
    name: "Ivory Lash Studio",
    tagline: "Extensions, brow lamination, PMU",
    description:
      "A tidy, light, almost clinical studio specialising in eye work. Our team trained under Anastasia Beverly Hills and Lash Heaven.",
    city: "Niš",
    address: "Obrenovićeva 18",
    phone: "+381 18 456 9911",
    cover: img("photo-1487412947147-5cebf100ffc2"),
    gallery: [
      img("photo-1487412947147-5cebf100ffc2"),
      img("photo-1522337094846-8a818192de1f"),
      img("photo-1571875257727-256c39da42af"),
    ],
    rating: 4.6,
    reviewCount: 76,
    categories: ["Lashes & Brows", "Makeup"],
    priceLevel: 2,
    openingHours: [
      { day: "Mon", hours: "11:00 – 19:00" },
      { day: "Tue", hours: "11:00 – 19:00" },
      { day: "Wed", hours: "11:00 – 19:00" },
      { day: "Thu", hours: "11:00 – 19:00" },
      { day: "Fri", hours: "10:00 – 20:00" },
      { day: "Sat", hours: "10:00 – 16:00" },
      { day: "Sun", hours: "Closed", closed: true },
    ],
    services: [
      {
        id: "lashes",
        name: "Volume Lash Extensions",
        description: "Full set, Russian volume, two-hour session.",
        price: 70,
        duration: 120,
        image: img("photo-1571875257727-256c39da42af", 400, 300),
        category: "Lashes & Brows",
      },
      {
        id: "brow",
        name: "Brow Lamination & Tint",
        description: "Straightening, tint and shaping with hydration mask.",
        price: 35,
        duration: 60,
        image: img("photo-1522337094846-8a818192de1f", 400, 300),
        category: "Lashes & Brows",
      },
    ],
  },
  {
    id: "maison-blanc",
    slug: "maison-blanc",
    name: "Maison Blanc",
    tagline: "Hair, color, bridal & waxing",
    description:
      "A full-service beauty maison in the heart of the old town. Book our resident senior stylist for special occasions.",
    city: "Subotica",
    address: "Korzo 9",
    phone: "+381 24 511 7788",
    cover: img("photo-1580618672591-eb180b1a973f"),
    gallery: [
      img("photo-1580618672591-eb180b1a973f"),
      img("photo-1554519515-242161756769"),
      img("photo-1600948836101-f9ffda59d250"),
    ],
    rating: 4.5,
    reviewCount: 54,
    categories: ["Hair", "Waxing", "Makeup"],
    priceLevel: 2,
    openingHours: [
      { day: "Mon", hours: "10:00 – 19:00" },
      { day: "Tue", hours: "10:00 – 19:00" },
      { day: "Wed", hours: "10:00 – 19:00" },
      { day: "Thu", hours: "10:00 – 20:00" },
      { day: "Fri", hours: "10:00 – 20:00" },
      { day: "Sat", hours: "09:00 – 17:00" },
      { day: "Sun", hours: "Closed", closed: true },
    ],
    services: [
      {
        id: "color",
        name: "Full Color",
        description: "Root-to-tip color with conditioning treatment.",
        price: 75,
        duration: 120,
        image: img("photo-1554519515-242161756769", 400, 300),
        category: "Hair",
      },
      {
        id: "wax",
        name: "Full Leg Wax",
        description: "Warm sugar wax and soothing cream finish.",
        price: 28,
        duration: 45,
        image: img("photo-1600948836101-f9ffda59d250", 400, 300),
        category: "Waxing",
      },
    ],
  },
  {
    id: "orchid-glow",
    slug: "orchid-glow",
    name: "Orchid Glow",
    tagline: "Clean beauty & slow rituals",
    description:
      "A plant-forward beauty studio. Minimal, airy and kind — our treatments are designed for real skin on real days.",
    city: "Kragujevac",
    address: "Kralja Aleksandra 30",
    phone: "+381 34 998 1122",
    cover: img("photo-1570172619644-dfd03ed5d881"),
    gallery: [
      img("photo-1570172619644-dfd03ed5d881"),
      img("photo-1544161515-4ab6ce6db874"),
    ],
    rating: 4.4,
    reviewCount: 41,
    categories: ["Skin & Face", "Massage", "Waxing"],
    priceLevel: 1,
    openingHours: [
      { day: "Mon", hours: "10:00 – 18:00" },
      { day: "Tue", hours: "10:00 – 18:00" },
      { day: "Wed", hours: "Closed", closed: true },
      { day: "Thu", hours: "10:00 – 18:00" },
      { day: "Fri", hours: "10:00 – 19:00" },
      { day: "Sat", hours: "10:00 – 16:00" },
      { day: "Sun", hours: "Closed", closed: true },
    ],
    services: [
      {
        id: "glow",
        name: "Glow Facial",
        description: "Gentle enzyme peel and vitamin-C infusion.",
        price: 55,
        duration: 60,
        image: img("photo-1519823551278-64ac92734fb1", 400, 300),
        category: "Skin & Face",
      },
    ],
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Ana Petrović",
    rating: 5,
    date: "2 days ago",
    body: "The most relaxing facial I've ever had. The aesthetician actually listened — my skin looked glass for a week. I've already rebooked for next month.",
    service: "Bespoke Signature Facial",
    salonId: "velvet-bloom",
  },
  {
    id: "r2",
    author: "Mila Jovanović",
    rating: 5,
    date: "1 week ago",
    body: "Rose Petal completely transformed my color. Hand-painted balayage, zero damage. Worth every dinar.",
    service: "Parisian Balayage",
    salonId: "rose-petal",
  },
  {
    id: "r3",
    author: "Teodora M.",
    rating: 4,
    date: "2 weeks ago",
    body: "Lilac & Co. is my forever nail spot. Designs are always precise and the studio smells like jasmine.",
    service: "Hand-painted Nail Art",
    salonId: "lilac-and-co",
  },
  {
    id: "r4",
    author: "Jovana",
    rating: 5,
    date: "3 weeks ago",
    body: "Ivory did my wedding lashes — held up through rain, champagne and happy tears. Cannot recommend enough.",
    service: "Volume Lash Extensions",
    salonId: "ivory-studio",
  },
  {
    id: "r5",
    author: "Marija",
    rating: 4,
    date: "1 month ago",
    body: "Maison Blanc is a lovely experience. Booking was seamless and the staff remembered my preferences from last time.",
    service: "Full Color",
    salonId: "maison-blanc",
  },
  {
    id: "r6",
    author: "Nina",
    rating: 5,
    date: "1 month ago",
    body: "The head spa is otherworldly. I scheduled one as a birthday gift and we both came out reset.",
    service: "Japanese Head Spa",
    salonId: "rose-petal",
  },
];

export const USER_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Parisian Balayage",
    date: "Thu, 2 May",
    time: "11:00",
    duration: 180,
    price: 140,
    status: "Approved",
    note: "Please keep the gold tones — no ashy.",
  },
  {
    id: "a2",
    salonId: "velvet-bloom",
    salonName: "Velvet Bloom Spa",
    salonCover: SALONS[2].cover,
    service: "Bespoke Signature Facial",
    date: "Sat, 4 May",
    time: "15:30",
    duration: 75,
    price: 95,
    status: "Pending",
  },
  {
    id: "a3",
    salonId: "lilac-and-co",
    salonName: "Lilac & Co.",
    salonCover: SALONS[1].cover,
    service: "Gel Overlay",
    date: "Mon, 22 Apr",
    time: "17:00",
    duration: 60,
    price: 32,
    status: "Completed",
  },
  {
    id: "a4",
    salonId: "ivory-studio",
    salonName: "Ivory Lash Studio",
    salonCover: SALONS[3].cover,
    service: "Brow Lamination & Tint",
    date: "Fri, 12 Apr",
    time: "12:00",
    duration: 60,
    price: 35,
    status: "Cancelled",
  },
  {
    id: "a5",
    salonId: "maison-blanc",
    salonName: "Maison Blanc",
    salonCover: SALONS[4].cover,
    service: "Full Color",
    date: "Tue, 9 Apr",
    time: "10:00",
    duration: 120,
    price: 75,
    status: "Rejected",
  },
];

export const DASHBOARD_APPOINTMENTS: Appointment[] = [
  {
    id: "d1",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Signature Cut & Style",
    date: "Today",
    time: "14:00",
    duration: 75,
    price: 55,
    status: "Pending",
    note: "First time — long curly hair, wants a soft trim.",
    customer: { name: "Lena Radović", phone: "+381 64 221 3319" },
  },
  {
    id: "d2",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Parisian Balayage",
    date: "Today",
    time: "16:30",
    duration: 180,
    price: 140,
    status: "Approved",
    customer: { name: "Milica P.", phone: "+381 61 884 2200" },
  },
  {
    id: "d3",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Japanese Head Spa",
    date: "Tomorrow",
    time: "10:00",
    duration: 60,
    price: 65,
    status: "Pending",
    customer: { name: "Katarina S.", phone: "+381 63 129 9400" },
  },
  {
    id: "d4",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Bridal Hair & Makeup",
    date: "Sat, 4 May",
    time: "08:00",
    duration: 180,
    price: 220,
    status: "Approved",
    customer: { name: "Ana J.", phone: "+381 66 412 7001" },
  },
  {
    id: "d5",
    salonId: "rose-petal",
    salonName: "Rose Petal Atelier",
    salonCover: SALONS[0].cover,
    service: "Signature Cut & Style",
    date: "Yesterday",
    time: "11:00",
    duration: 75,
    price: 55,
    status: "Completed",
    customer: { name: "Sofija M.", phone: "+381 65 443 2266" },
  },
];

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "18:00",
  "18:30",
];

export const BOOKED_SLOTS = new Set(["10:30", "13:00", "15:30", "17:00"]);

export function getSalon(slugOrId: string) {
  return SALONS.find((s) => s.slug === slugOrId || s.id === slugOrId);
}

export function reviewsForSalon(salonId: string) {
  return REVIEWS.filter((r) => r.salonId === salonId);
}

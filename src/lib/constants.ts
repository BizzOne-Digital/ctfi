/**
 * Central defaults used to seed the database and as graceful fallbacks if a
 * collection is empty or the database is briefly unreachable. None of this
 * is "fake business content" — it is clearly-labeled placeholder copy the
 * admin is expected to replace from the dashboard.
 */

export interface ThemeShape {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  buttonStyle: "rounded" | "pill" | "square";
  borderRadius: "none" | "small" | "medium" | "large";
  headingFont: "serif" | "sans";
  headerStyle: "standard" | "transparent";
  heroStyle: "full" | "split";
  sectionSpacing: "compact" | "comfortable" | "spacious";
}

export const DEFAULT_THEME: ThemeShape = {
  colorPrimary: "#9C5A34",
  colorSecondary: "#E9DCC5",
  colorAccent: "#C08A4E",
  colorBackground: "#FBF6EF",
  colorForeground: "#2B2420",
  colorMuted: "#8A7B6C",
  buttonStyle: "rounded",
  borderRadius: "medium",
  headingFont: "serif",
  headerStyle: "standard",
  heroStyle: "full",
  sectionSpacing: "comfortable",
};

export const DEFAULT_SITE_SETTINGS = {
  businessName: "Country Tyme Foto Imaging, LLC",
  phone: "+1 843-327-1896",
  email: "ctfillc.info@gmail.com",
  address: "",
  instagramUrl: "https://www.instagram.com/ctfillc",
  facebookUrl: "https://www.facebook.com/ctfillc",
  xUrl: "https://www.x.com/ctfillc",
  tiktokUrl: "https://www.tiktok.com/@ctfillc",
  logoMediaId: "",
  faviconMediaId: "",
  seoTitle: "Country Tyme Foto Imaging | Professional Photography",
  seoDescription:
    "Country Tyme Foto Imaging, LLC creates warm, personal, professional portraits that let your true self shine through. Book your session today.",
  ogImageMediaId: "",
  footerText:
    "Empowering everyone to see the beauty within themselves so it shines through in every photo.",
  copyrightText: `Country Tyme Foto Imaging, LLC. All rights reserved.`,
};

export const DEFAULT_NAVIGATION = [
  { label: "Home", url: "/", order: 0, visible: true, openInNewTab: false },
  { label: "About", url: "/about", order: 1, visible: true, openInNewTab: false },
  { label: "Services", url: "/services", order: 2, visible: true, openInNewTab: false },
  { label: "Contact", url: "/contact", order: 3, visible: true, openInNewTab: false },
  { label: "Client Gallery", url: "/gallery", order: 4, visible: true, openInNewTab: false },
  { label: "Book Appointment", url: "/book", order: 5, visible: true, openInNewTab: false },
];

export const DEFAULT_SERVICES = [
  {
    title: "Portrait Photography",
    slug: "portrait-photography",
    shortDescription:
      "One-on-one sessions designed to capture your personality and confidence in every frame.",
    fullDescription:
      "A relaxed, guided portrait session focused on making you feel comfortable in front of the camera. Placeholder content — replace with your final service details from the admin dashboard.",
    startingPrice: null,
    priceLabel: "Starting price — set in admin",
    duration: "",
    ctaText: "Book This Session",
    order: 0,
    active: true,
  },
  {
    title: "Individual Sessions",
    slug: "individual-sessions",
    shortDescription:
      "Personalized photography for graduations, milestones, professional headshots, and more.",
    fullDescription:
      "Placeholder content — replace with your final service details from the admin dashboard.",
    startingPrice: null,
    priceLabel: "Starting price — set in admin",
    duration: "",
    ctaText: "Book This Session",
    order: 1,
    active: true,
  },
  {
    title: "Family Photography",
    slug: "family-photography",
    shortDescription:
      "Warm, genuine family portraits that capture connection and the moments that matter.",
    fullDescription:
      "Placeholder content — replace with your final service details from the admin dashboard.",
    startingPrice: null,
    priceLabel: "Starting price — set in admin",
    duration: "",
    ctaText: "Book This Session",
    order: 2,
    active: true,
  },
  {
    title: "Special Moments",
    slug: "special-moments",
    shortDescription:
      "Celebrating engagements, anniversaries, and life's meaningful milestones.",
    fullDescription:
      "Placeholder content — replace with your final service details from the admin dashboard.",
    startingPrice: null,
    priceLabel: "Starting price — set in admin",
    duration: "",
    ctaText: "Book This Session",
    order: 3,
    active: true,
  },
];

export const DEFAULT_BENEFITS = [
  {
    title: "Personalized Experience",
    description:
      "Every session is tailored to you — your comfort, your story, your vision.",
    icon: "Heart",
  },
  {
    title: "Professional Photography",
    description:
      "Thoughtful lighting, composition, and direction from a dedicated photographer.",
    icon: "Camera",
  },
  {
    title: "Your Story, Your Way",
    description:
      "We listen first, then create images that genuinely reflect who you are.",
    icon: "BookOpen",
  },
  {
    title: "Confidence in Every Image",
    description:
      "Our goal is simple: help you see the beauty in yourself that others already see.",
    icon: "Sparkles",
  },
];

export const DEFAULT_HOME_SECTIONS = [
  {
    key: "hero",
    order: 0,
    visible: true,
    heading: "Country Tyme Foto Imaging",
    subheading:
      "Empowering everyone to see the beauty within themselves so it shines through in every photo created by Country Tyme Foto Imaging.",
    ctaText: "Book an Appointment",
    ctaLink: "/book",
    body: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "intro",
    order: 1,
    visible: true,
    heading: "Photography, From the Heart",
    subheading: "",
    body:
      "Country Tyme Foto Imaging exists to empower people to see the beauty within themselves — and to let that beauty shine through in every photograph we create. Every session is approached with warmth, patience, and genuine care, because the best portraits come from feeling truly comfortable in front of the camera.",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "services_preview",
    order: 2,
    visible: true,
    heading: "Our Services",
    subheading: "A few of the ways we can capture your story — fully editable from the admin dashboard.",
    body: "",
    ctaText: "View All Services",
    ctaLink: "/services",
    imageMediaId: "",
    items: [],
  },
  {
    key: "why_choose",
    order: 3,
    visible: true,
    heading: "Why Choose Country Tyme",
    subheading: "",
    body: "",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: DEFAULT_BENEFITS,
  },
  {
    key: "featured_gallery",
    order: 4,
    visible: true,
    heading: "A Glimpse of Our Work",
    subheading: "Select images are shown here — the admin chooses what appears.",
    body: "",
    ctaText: "View Gallery",
    ctaLink: "/gallery",
    imageMediaId: "",
    items: [],
  },
  {
    key: "appointment_cta",
    order: 5,
    visible: true,
    heading: "Ready to See Yourself in a New Light?",
    subheading: "",
    body: "",
    ctaText: "Book Your Appointment",
    ctaLink: "/book",
    imageMediaId: "",
    items: [],
  },
  {
    key: "social",
    order: 6,
    visible: true,
    heading: "Follow Along",
    subheading: "",
    body: "",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
];

export const DEFAULT_ABOUT_SECTIONS = [
  {
    key: "intro",
    order: 0,
    visible: true,
    heading: "About Country Tyme Foto Imaging",
    subheading: "",
    body:
      "Country Tyme Foto Imaging, LLC is a professional photography studio built around one simple belief: everyone deserves to see the beauty within themselves. This introduction is placeholder content — replace it from the admin dashboard with your own words.",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "mission",
    order: 1,
    visible: true,
    heading: "Our Mission",
    subheading: "",
    body:
      "To empower people to see the beauty within themselves so it shines through in every photograph we create — with warmth, patience, and genuine care in every session.",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "philosophy",
    order: 2,
    visible: true,
    heading: "Our Photography Philosophy",
    subheading: "",
    body:
      "Placeholder content — describe your approach to lighting, direction, and making clients feel comfortable. Replace from the admin dashboard.",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "owner",
    order: 3,
    visible: true,
    heading: "Meet Richard",
    subheading: "",
    body:
      "Placeholder content — add a personal introduction here whenever you're ready. Replace from the admin dashboard.",
    ctaText: "",
    ctaLink: "",
    imageMediaId: "",
    items: [],
  },
  {
    key: "cta",
    order: 4,
    visible: true,
    heading: "Let's Create Something Beautiful Together",
    subheading: "",
    body: "",
    ctaText: "Book Your Appointment",
    ctaLink: "/book",
    imageMediaId: "",
    items: [],
  },
];

export const DEFAULT_AVAILABILITY = {
  workingDays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
  appointmentDurationMinutes: 60,
  bufferMinutes: 15,
  breaks: [{ start: "12:00", end: "13:00" }],
  closedDates: [] as string[],
  bookingEnabled: true,
};

export const SOCIAL_ICONS = ["instagram", "facebook", "x"] as const;

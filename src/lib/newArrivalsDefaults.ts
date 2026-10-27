export interface NewArrivalsData {
  isEnabled: boolean;
  tagline: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  limit: number;
  productIds: string[];
}

export const DEFAULT_NEW_ARRIVALS_DATA: NewArrivalsData = {
  isEnabled: true,
  tagline: "NEW IN",
  title: "", // Clean by default - "Latest arrivals, crafted for slow living" removed
  subtitle: "",
  buttonText: "Explore All",
  buttonLink: "/shop/new-in",
  limit: 4,
  productIds: [],
};

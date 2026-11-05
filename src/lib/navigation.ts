export type RouteStatus = "live" | "planned";

export interface NavigationLink {
  label: string;
  href: string;
  status: RouteStatus;
}

export interface MenuLink extends NavigationLink {
  children?: readonly NavigationLink[];
}

export const homeRoute: NavigationLink = {
  label: "Home",
  href: "/",
  status: "live",
};

export const primaryNavigation: readonly MenuLink[] = [
  {
    label: "Shop",
    href: "/shop",
    status: "planned",
    children: [
      { label: "Shop All", href: "/shop", status: "planned" },
      { label: "Shirts", href: "/shop?category=shirts", status: "planned" },
      { label: "Trousers", href: "/shop?category=trousers", status: "planned" },
      { label: "Knitwear", href: "/shop?category=knitwear", status: "planned" },
      {
        label: "Outerwear",
        href: "/shop?category=outerwear",
        status: "planned",
      },
      {
        label: "Essentials",
        href: "/shop?category=essentials",
        status: "planned",
      },
    ],
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
    status: "planned",
  },
  {
    label: "Collections",
    href: "/collections",
    status: "planned",
    children: [
      { label: "All Collections", href: "/collections", status: "planned" },
      {
        label: "Modern Tailoring",
        href: "/collections?collection=modern-tailoring",
        status: "planned",
      },
      {
        label: "Everyday Essentials",
        href: "/collections?collection=everyday-essentials",
        status: "planned",
      },
      {
        label: "Off-Duty Forms",
        href: "/collections?collection=off-duty-forms",
        status: "planned",
      },
    ],
  },
  {
    label: "Our Story",
    href: "/our-story",
    status: "planned",
  },
  {
    label: "Track Parcel",
    href: "/track",
    status: "planned",
  },
  {
    label: "Shopping Bag",
    href: "/cart",
    status: "planned",
  },
] as const;

export const shopDestination: NavigationLink = {
  label: "Shop All",
  href: "/shop",
  status: "planned",
};

export const utilityNavigation = {
  search: {
    label: "Search",
    href: "/search",
    status: "planned",
  },
  account: {
    label: "Account",
    href: "/account",
    status: "planned",
  },
  tracking: {
    label: "Track Parcel",
    href: "/track",
    status: "planned",
  },
  bag: {
    label: "Shopping Bag",
    href: "/cart",
    status: "planned",
  },
} as const satisfies Record<string, NavigationLink>;

export function prefetchFor(link: NavigationLink): false | undefined {
  return link.status === "live" ? undefined : false;
}

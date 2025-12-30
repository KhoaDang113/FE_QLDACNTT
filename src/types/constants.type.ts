import { type LucideIcon } from "lucide-react";
export type SocialLink = {
  label: "SiFacebook" | "SiYoutube" | "SiInstagram";
  to: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type Collaborates = {
  label: string;
  to: string;
  image: string;
};

export type NavItem = { label: string; to: string };

export type ContactItem = {
  title: string;
  value: string;
  Icon: LucideIcon;
};

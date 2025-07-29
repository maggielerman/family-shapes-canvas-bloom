import { 
  Building2,
  Users2,
  Shield,
  FileText,
  Settings,
  MessageSquare,
  Network,
  UserCheck
} from "lucide-react";

export interface OrganizationFeature {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const organizationFeatures: OrganizationFeature[] = [
  {
    id: "inter-organization-collaboration",
    label: "Inter-Organization Collaboration",
    description: "Securely share donor data across cryobanks and fertility clinics to prevent \"super-donors,\" maintain regulatory compliance, and ensure ethical accountability.",
    icon: Building2
  },
  {
    id: "recipient-family-portal",
    label: "Recipient Family Portal",
    description: "Personalized dashboard allowing families to visualize donor-conceived relationships, manage family trees, report births, share health updates, and access key documents.",
    icon: Users2
  },
  {
    id: "donor-portal",
    label: "Donor Portal",
    description: "Dedicated space enabling donors to manage personal information, medical history, and privacy settings; optionally create linked accounts for their own children or other genetic relatives interested in connecting with donor-conceived sibling networks, with mutual consent-based sharing controls.",
    icon: UserCheck
  },
  {
    id: "document-consent-management",
    label: "Document and Consent Management",
    description: "Secure storage and management of signed contracts, letters of consent, medical disclosures, and other sensitive documents, with HIPAA-compliant protocols and audit-ready access controls.",
    icon: FileText
  },
  {
    id: "granular-privacy-controls",
    label: "Granular Privacy and Information Controls",
    description: "Customizable anonymity and privacy settings for donors and recipient families, including streamlined, secure release of donor details to donor-conceived individuals upon adulthood or based on user-defined milestones.",
    icon: Shield
  },
  {
    id: "community-communication-tools",
    label: "Community and Communication Tools",
    description: "Moderated communities, direct messaging, and discussion groups specifically tailored to donor-conceived individuals, donors, and families.",
    icon: MessageSquare
  },
  {
    id: "relationship-tracking-visualization",
    label: "Relationship Tracking and Data Visualization",
    description: "Interactive tools for exploring donor-conceived sibling (\"dibling\") networks, intuitive family trees, maps, and relationship analytics.",
    icon: Network
  }
]; 
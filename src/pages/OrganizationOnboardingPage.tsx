import { useParams } from "react-router-dom";
import OrganizationOnboarding from "@/components/organizations/OrganizationOnboarding";

export default function OrganizationOnboardingPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Invalid organization ID</div>;
  }

  return <OrganizationOnboarding organizationId={id} />;
}
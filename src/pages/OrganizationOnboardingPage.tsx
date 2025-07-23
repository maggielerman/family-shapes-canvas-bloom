import { useParams } from "react-router-dom";
import OrganizationOnboarding from "@/components/organizations/OrganizationOnboarding";

export default function OrganizationOnboardingPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Invalid Organization</h1>
          <p className="text-muted-foreground mt-2">
            The organization ID is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  return <OrganizationOnboarding organizationId={id} />;
}
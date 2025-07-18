import { useParams, useSearchParams } from "react-router-dom";
import { PublicFamilyTreeViewer } from "@/components/family-trees/PublicFamilyTreeViewer";

export default function PublicFamilyTree() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <PublicFamilyTreeViewer
      treeId={id}
      isPublicLink={!!token}
      accessToken={token || undefined}
    />
  );
}
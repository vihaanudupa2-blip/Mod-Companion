import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: me, isLoading, error } = useGetMe();

  useEffect(() => {
    if (!isLoading && (error || !me)) {
      setLocation("/login");
    }
  }, [isLoading, me, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!me) return null;

  return <>{children}</>;
}

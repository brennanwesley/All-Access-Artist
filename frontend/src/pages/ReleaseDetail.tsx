import { AppShell } from "@/components/AppShell";
import { ReleaseDetail as ReleaseDetailComponent } from "@/components/ReleaseDetail";
import { useNavigation } from "@/contexts/NavigationContext";

const ReleaseDetail = () => {
  const navigation = useNavigation();

  const handleBackToReleases = () => {
    navigation.navigateToSection("releases");
  };

  return (
    <AppShell rootClassName="min-h-screen bg-gradient-subtle" mainClassName="min-h-screen md:ml-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <ReleaseDetailComponent onBack={handleBackToReleases} />
    </AppShell>
  );
};

export default ReleaseDetail;

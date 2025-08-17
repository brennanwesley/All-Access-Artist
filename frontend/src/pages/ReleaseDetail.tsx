import { Navigation } from "@/components/Navigation";
import { ReleaseDetail as ReleaseDetailComponent } from "@/components/ReleaseDetail";
import { useNavigation } from "@/contexts/NavigationContext";

const ReleaseDetail = () => {
  const navigation = useNavigation();

  const handleBackToReleases = () => {
    navigation.navigateToSection("releases");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="ml-64 p-8">
        <ReleaseDetailComponent onBack={handleBackToReleases} />
      </main>
    </div>
  );
};

export default ReleaseDetail;

import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ReleaseDetail as ReleaseDetailComponent } from "@/components/ReleaseDetail";
import { useNavigation } from "@/contexts/NavigationContext";

const ReleaseDetail = () => {
  const { id } = useParams();
  const navigation = useNavigation();

  const handleBackToReleases = () => {
    navigation.navigateToSection("releases");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="ml-64 p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToReleases}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Releases
          </Button>
        </div>
        <ReleaseDetailComponent onBack={handleBackToReleases} />
      </main>
    </div>
  );
};

export default ReleaseDetail;

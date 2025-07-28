import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
              All Access Artist
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Giving you all access to build a career you're proud of.
            </p>
          </div>
          
          <div className="pt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              Let's Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
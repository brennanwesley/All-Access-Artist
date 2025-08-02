import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Music } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewReleaseFormProps {
  onBack: () => void;
}

export const NewReleaseForm = ({ onBack }: NewReleaseFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    releaseDate: "",
    productType: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.releaseDate || !formData.productType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "New release created successfully!",
    });
    
    // Reset form and go back
    setFormData({ title: "", releaseDate: "", productType: "" });
    onBack();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Release Manager
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Create New Release</h2>
          <p className="text-muted-foreground mt-2">
            Add a new track, EP, or album to your release schedule
          </p>
        </div>
      </div>

      <Card className="max-w-2xl bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Music className="h-5 w-5 text-primary" />
            Release Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Track or Project Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter your track or project title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Target Release Date *</Label>
              <div className="relative">
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Type of Product *</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => setFormData({ ...formData, productType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="flex-1">
                Create Release
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
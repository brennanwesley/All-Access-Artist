import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Contributor, CONTRIBUTOR_ROLES } from "./types";

type ContributorFieldValue = Contributor[keyof Contributor];

interface ContributorRowProps {
  contributor: Contributor;
  index: number;
  onChange: (index: number, field: keyof Contributor, value: ContributorFieldValue) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  isReadOnly: boolean;
}

export const ContributorRow = ({ 
  contributor, 
  index, 
  onChange, 
  onRemove, 
  canRemove,
  isReadOnly 
}: ContributorRowProps) => {
  const handleFieldChange = (field: keyof Contributor, value: ContributorFieldValue) => {
    onChange(index, field, value);
  };

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-border/50 bg-card/30 p-3 md:grid-cols-12 md:gap-2 md:items-start">
      <div className="flex items-center justify-between md:hidden">
        <p className="text-sm font-medium">Contributor {index + 1}</p>
        {canRemove && !isReadOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Legal Name */}
      <div className="space-y-1 md:col-span-3">
        <Label className="text-xs text-muted-foreground md:hidden">Legal Name</Label>
        <Input
          placeholder="Full legal name *"
          value={contributor.legal_name}
          onChange={(e) => handleFieldChange('legal_name', e.target.value)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Role */}
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-muted-foreground md:hidden">Role</Label>
        <Select
          value={contributor.role}
          onValueChange={(value) => handleFieldChange('role', value as Contributor["role"])}
          disabled={isReadOnly}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {CONTRIBUTOR_ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Writer Share % */}
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-muted-foreground md:hidden">Writer %</Label>
        <Input
          placeholder="Writer %"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={contributor.writer_share_percent || ''}
          onChange={(e) => handleFieldChange('writer_share_percent', parseFloat(e.target.value) || 0)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Publisher Share % */}
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-muted-foreground md:hidden">Publisher %</Label>
        <Input
          placeholder="Publisher %"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={contributor.publisher_share_percent || ''}
          onChange={(e) => handleFieldChange('publisher_share_percent', parseFloat(e.target.value) || 0)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Publishing Info */}
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs text-muted-foreground md:hidden">Publisher / PRO</Label>
        <Input
          placeholder="Publisher/PRO"
          value={contributor.pro_affiliation || ''}
          onChange={(e) => handleFieldChange('pro_affiliation', e.target.value)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Remove Button */}
      <div className="hidden md:col-span-1 md:flex md:justify-center">
        {canRemove && !isReadOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

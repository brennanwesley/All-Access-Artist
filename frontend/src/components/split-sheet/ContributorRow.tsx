import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Contributor, CONTRIBUTOR_ROLES } from "./types";

interface ContributorRowProps {
  contributor: Contributor;
  index: number;
  onChange: (index: number, field: keyof Contributor, value: any) => void;
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
  const handleFieldChange = (field: keyof Contributor, value: any) => {
    onChange(index, field, value);
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 bg-card/30 rounded-lg">
      {/* Legal Name */}
      <div className="col-span-3">
        <Input
          placeholder="Full legal name *"
          value={contributor.legal_name}
          onChange={(e) => handleFieldChange('legal_name', e.target.value)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Role */}
      <div className="col-span-2">
        <Select
          value={contributor.role}
          onValueChange={(value) => handleFieldChange('role', value)}
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
      <div className="col-span-2">
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
      <div className="col-span-2">
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
      <div className="col-span-2">
        <Input
          placeholder="Publisher/PRO"
          value={contributor.pro_affiliation || ''}
          onChange={(e) => handleFieldChange('pro_affiliation', e.target.value)}
          disabled={isReadOnly}
          className="text-sm"
        />
      </div>

      {/* Remove Button */}
      <div className="col-span-1 flex justify-center">
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

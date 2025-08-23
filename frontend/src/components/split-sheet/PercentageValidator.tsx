import { CheckCircle, AlertTriangle } from "lucide-react";
import { PercentageValidation } from "./types";

interface PercentageValidatorProps {
  validation: PercentageValidation;
  className?: string;
}

export const PercentageValidator = ({ validation, className = "" }: PercentageValidatorProps) => {
  return (
    <div className={`bg-muted p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Percentage Validation</h4>
        <div className="flex items-center gap-1">
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Writer Shares:</span>
          <span className={`font-medium ${validation.writerValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.writerTotal}% {validation.writerValid ? '✓' : '⚠️'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Publisher Shares:</span>
          <span className={`font-medium ${validation.publisherValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.publisherTotal}% {validation.publisherValid ? '✓' : '⚠️'}
          </span>
        </div>
      </div>
      
      {!validation.isValid && (
        <p className="text-xs text-muted-foreground mt-2">
          Both Writer and Publisher shares must total exactly 100% each to save.
        </p>
      )}
    </div>
  );
};

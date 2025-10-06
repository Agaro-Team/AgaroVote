/**
 * CandidatesArrayField Component
 *
 * A dynamic array field for managing voting pool candidates.
 * Allows adding/removing candidates with a minimum of 2 required.
 */
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import * as React from 'react';

interface CandidatesArrayFieldProps {
  candidates: string[];
  onChange: (candidates: string[]) => void;
  onBlur?: () => void;
  errors?: string[];
}

export function CandidatesArrayField({
  candidates,
  onChange,
  onBlur,
  errors = [],
}: CandidatesArrayFieldProps) {
  const handleAddCandidate = () => {
    onChange([...candidates, '']);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 2) return; // Minimum 2 candidates required
    const newCandidates = candidates.filter((_, i) => i !== index);
    onChange(newCandidates);
  };

  const handleCandidateChange = (index: number, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    onChange(newCandidates);
  };

  const hasError = errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FieldLabel>
          Candidates <span className="text-muted-foreground">({candidates.length} total)</span>
        </FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCandidate}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <label
                  htmlFor={`candidate-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Candidate {index + 1}
                </label>
              </div>
              <Input
                id={`candidate-${index}`}
                value={candidate}
                onChange={(e) => handleCandidateChange(index, e.target.value)}
                onBlur={onBlur}
                placeholder={`Enter candidate ${index + 1} name`}
                aria-invalid={hasError}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveCandidate(index)}
              disabled={candidates.length <= 2}
              className="mt-7"
              aria-label={`Remove candidate ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {hasError && (
        <div className="text-sm font-medium text-destructive" role="alert">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Add at least 2 candidates for your voting pool. Each candidate must have a name.
      </p>
    </div>
  );
}

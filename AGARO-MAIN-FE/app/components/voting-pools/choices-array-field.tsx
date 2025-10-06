/**
 * ChoicesArrayField Component
 *
 * A dynamic array field for managing voting pool choices.
 * Allows adding/removing choices with a minimum of 2 required.
 */
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import * as React from 'react';

interface ChoicesArrayFieldProps {
  choices: string[];
  onChange: (choices: string[]) => void;
  onBlur?: () => void;
  errors?: string[];
}

export function ChoicesArrayField({
  choices,
  onChange,
  onBlur,
  errors = [],
}: ChoicesArrayFieldProps) {
  const handleAddChoice = () => {
    onChange([...choices, '']);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length <= 2) return; // Minimum 2 choices required
    const newChoices = choices.filter((_, i) => i !== index);
    onChange(newChoices);
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    onChange(newChoices);
  };

  const hasError = errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FieldLabel>
          Choices <span className="text-muted-foreground">({choices.length} total)</span>
        </FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddChoice}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Choice
        </Button>
      </div>

      <div className="space-y-3">
        {choices.map((choice, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <label
                  htmlFor={`choice-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Choice {index + 1}
                </label>
              </div>
              <Input
                id={`choice-${index}`}
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                onBlur={onBlur}
                placeholder={`Enter choice ${index + 1} name`}
                aria-invalid={hasError}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveChoice(index)}
              disabled={choices.length <= 2}
              className="mt-7"
              aria-label={`Remove choice ${index + 1}`}
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
        Add at least 2 choices for your voting pool. Each choice must have a name.
      </p>
    </div>
  );
}

/**
 * ChoicesArrayField Component
 *
 * A dynamic array field for managing voting pool choices.
 * Allows adding/removing choices with a minimum of 2 required.
 */
import { Trash2 } from 'lucide-react';

import { FieldError, FieldLabel, withForm } from '../form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { votingPoolFormOptions } from './voting-pool-form-options';

export const ChoicesArrayField = withForm({
  ...votingPoolFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="choices" mode="array">
        {(field) => {
          const hasError =
            field.state.meta.isTouched &&
            !field.state.meta.isValid &&
            field.state.meta.errors.length > 0;

          return (
            <div
              data-invalid={hasError}
              onFocus={() => {
                field.setMeta((prev) => ({
                  ...prev,
                  isTouched: true,
                }));
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <FieldLabel htmlFor={field.name}>
                  Choices ({field.state.value.length} total)
                </FieldLabel>

                <Button type="button" onClick={() => field.pushValue('')}>
                  Add Choice
                </Button>
              </div>

              <div className="flex flex-col gap-2" data-invalid={hasError}>
                {field.state.value.map((__, index) => (
                  <form.Field key={index} name={`choices[${index}]`}>
                    {(subField) => {
                      const hasError =
                        subField.state.meta.isTouched &&
                        !subField.state.meta.isValid &&
                        subField.state.meta.errors.length > 0;

                      return (
                        <div className="flex gap-2 items-start">
                          <Input
                            id={`choices.${index}`}
                            name={`choices.${index}`}
                            value={subField.state.value}
                            onChange={(e) => subField.handleChange(e.target.value)}
                            onBlur={subField.handleBlur}
                            aria-invalid={hasError}
                            placeholder="Choice"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => field.removeValue(index)}
                            disabled={field.state.value.length <= 2}
                            aria-label={`Remove choice ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    }}
                  </form.Field>
                ))}
              </div>

              {hasError &&
                field.state.meta.errors?.map((error, index) => (
                  <FieldError key={index}>{error?.message}</FieldError>
                ))}
            </div>
          );
        }}
      </form.AppField>
    );
  },
});

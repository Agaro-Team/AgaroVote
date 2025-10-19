import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for BigInt values
 * Validates that a value can be converted to a valid BigInt
 */
@ValidatorConstraint({ name: 'isBigInt', async: false })
export class IsBigIntConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    // If it's already a bigint
    if (typeof value === 'bigint') {
      return true;
    }

    // If it's a string, try to parse as bigint
    if (typeof value === 'string') {
      try {
        BigInt(value);
        return true;
      } catch {
        return false;
      }
    }

    // If it's a number, check if it's an integer
    if (typeof value === 'number') {
      return Number.isInteger(value) && Number.isSafeInteger(value);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid BigInt value (string, number, or bigint)`;
  }
}

/**
 * Decorator to validate BigInt values
 * Accepts string, number, or bigint types
 *
 * @example
 * ```typescript
 * class TransferDto {
 *   @IsBigInt()
 *   amount: string | bigint;
 * }
 * ```
 */
export function IsBigInt(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBigIntConstraint,
    });
  };
}

/**
 * Custom validator for positive BigInt values
 */
@ValidatorConstraint({ name: 'isPositiveBigInt', async: false })
export class IsPositiveBigIntConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    try {
      const bigIntValue =
        typeof value === 'bigint'
          ? value
          : typeof value === 'string' || typeof value === 'number'
            ? BigInt(value)
            : BigInt(JSON.stringify(value));
      return bigIntValue > 0n;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a positive BigInt value`;
  }
}

/**
 * Decorator to validate positive BigInt values
 *
 * @example
 * ```typescript
 * class TransferDto {
 *   @IsPositiveBigInt()
 *   amount: string;
 * }
 * ```
 */
export function IsPositiveBigInt(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPositiveBigIntConstraint,
    });
  };
}

/**
 * Custom validator for BigInt within a range
 */
@ValidatorConstraint({ name: 'isBigIntInRange', async: false })
export class IsBigIntInRangeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    const [min, max] = args.constraints as [string | bigint, string | bigint];

    try {
      const bigIntValue =
        typeof value === 'bigint'
          ? value
          : typeof value === 'string' || typeof value === 'number'
            ? BigInt(value)
            : BigInt(JSON.stringify(value));
      const minValue = typeof min === 'bigint' ? min : BigInt(String(min));
      const maxValue = typeof max === 'bigint' ? max : BigInt(String(max));

      return bigIntValue >= minValue && bigIntValue <= maxValue;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [min, max] = args.constraints as [string | bigint, string | bigint];
    return `${args.property} must be a BigInt between ${min} and ${max}`;
  }
}

/**
 * Decorator to validate BigInt values within a range
 *
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 *
 * @example
 * ```typescript
 * class TransferDto {
 *   @IsBigIntInRange('0', '1000000000000000000') // 0 to 1 ETH in wei
 *   amount: string;
 * }
 * ```
 */
export function IsBigIntInRange(
  min: string | bigint,
  max: string | bigint,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min, max],
      validator: IsBigIntInRangeConstraint,
    });
  };
}

/**
 * Custom validator for Ethereum address amounts (wei)
 */
@ValidatorConstraint({ name: 'isWeiAmount', async: false })
export class IsWeiAmountConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    try {
      const bigIntValue =
        typeof value === 'bigint'
          ? value
          : typeof value === 'string' || typeof value === 'number'
            ? BigInt(value)
            : BigInt(JSON.stringify(value));
      // Must be non-negative and not exceed max uint256
      return (
        bigIntValue >= 0n &&
        bigIntValue <=
          BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          )
      );
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid wei amount (non-negative uint256)`;
  }
}

/**
 * Decorator to validate Ethereum wei amounts
 * Ensures value is a valid uint256 (0 to 2^256 - 1)
 *
 * @example
 * ```typescript
 * class TransferDto {
 *   @IsWeiAmount()
 *   amount: string;
 * }
 * ```
 */
export function IsWeiAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWeiAmountConstraint,
    });
  };
}

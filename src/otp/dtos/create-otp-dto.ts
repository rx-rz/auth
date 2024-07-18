import {
  IsOptional,
  IsString,
  Length,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  ValidateIf,
  IsDateString,
} from 'class-validator';

export class CreateOtpDto {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.adminId)
  @AtMostAdminOrUserId('adminId')
  userId: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.userId)
  @AtMostAdminOrUserId('userId')
  adminId: string;
}

//decorator factory that checks if at most one user id or admin id is set
function AtMostAdminOrUserId(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      name: 'atMostAdminOrUserID',
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return !(!!value && !!relatedValue);
        },
      },
    });
  };
}

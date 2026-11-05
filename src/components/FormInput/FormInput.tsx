import React from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { AppTextInput, type AppTextInputProps } from '../AppTextInput';

export type FormInputProps<T extends FieldValues> = Omit<
  AppTextInputProps,
  'value' | 'onChangeText' | 'error'
> & {
  name: Path<T>;
  control: Control<T>;
};

export function FormInput<T extends FieldValues>({
  name,
  control,
  onBlur,
  ...rest
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <AppTextInput
          {...rest}
          ref={field.ref}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={e => {
            field.onBlur();
            onBlur?.(e);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

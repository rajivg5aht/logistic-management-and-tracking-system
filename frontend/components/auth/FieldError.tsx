type FieldErrorProps = {
  errors?: string[];
};

export function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-red-400">{errors[0]}</p>;
}

type FieldErrorProps = {
  errors?: string[];
};

export function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-[var(--danger)]">{errors[0]}</p>;
}

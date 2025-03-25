import React from 'react';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

type FormInputProps = {
    label: string;
    name: string;
    type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput: React.FC<FormInputProps> = ({
                                                 label,
                                                 name,
                                                 type = 'text',
                                                 ...props
                                             }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error = errors[name];
    const hasError = !!error;

    return (
        <div className="space-y-1">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-ct-blue-600"
            >
                {label}
            </label>
            <input
                {...register(name)}
                {...props}
                type={type}
                id={name}
                aria-invalid={hasError ? "true" : "false"}
                className={twMerge(
                    'block w-full rounded-2xl border border-ct-border',
                    'px-4 py-2 text-ct-text focus:outline-none focus:ring-2',
                    'focus:ring-ct-blue-500 focus:border-ct-blue-500',
                    hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500'
                )}
            />
            {hasError && (
                <span
                    role="alert"
                    className="text-red-500 text-sm mt-1 block"
                >
          {error.message?.toString()}
        </span>
            )}
        </div>
    );
};

export default FormInput;
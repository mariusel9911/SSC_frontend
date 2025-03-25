interface ErrorWithMessage {
    message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (isErrorWithMessage(error)) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
};

export {}; // Ensure this file is treated as a module
export const success = (data: any, message = "Success") => ({
    success: true,
    message,
    data,
});

export const error = (message: string) => ({
    success: false,
    error: message,
});

export interface IStandardResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T | null;
    error?: string | null;
    path?: string;
    timestamp: string;
}

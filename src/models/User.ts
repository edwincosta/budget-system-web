export interface User {
    _id?: string;
    name: string;
    email: string;
    password?: string; // A senha geralmente não é necessária no cliente
    forecasts: string[]; // Array de IDs de Forecast
}
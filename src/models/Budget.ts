export interface Budget {
    _id?: string;
    type: 'Betel' | 'Pessoal';
    month: number;
    year: number;
    amount: number;
    forecast: string; // ID de Forecast
}
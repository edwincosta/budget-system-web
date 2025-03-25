export interface Forecast {
    _id?: string;
    name: string;
    budgets: string[]; // Array de IDs de Budget
    users: string[]; // Array de IDs de User
}
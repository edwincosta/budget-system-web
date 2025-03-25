export interface Expense {
    _id?: string;
    name: string;
    amount: number;
    date: Date;
    category: string; // ID de Category
    subcategory?: string; // ID de Subcategory
}
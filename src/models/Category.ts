export interface Category {
    _id?: string;
    budget: string; // ID de Budget
    name: string;
    amount: number;
    subcategories: string[]; // Array de IDs de Subcategory
}
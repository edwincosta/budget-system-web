export interface Subcategory {
    _id?: string;
    name: string;
    amount: number;
    isPersonal: boolean;
    category: string; // ID de Category
}
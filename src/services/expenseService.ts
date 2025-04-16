import { IExpense, ApiResponse, IMonthlyExpenses } from 'budget-system-shared';
import axiosInstance from '../axiosConfig';

const EXPENSES_API_URL = '/expenses'; // Atualize com a URL do servidor

const getCurrentExpenses = async (): Promise<ApiResponse<IMonthlyExpenses>> => {
    const response = await axiosInstance.get<ApiResponse<IMonthlyExpenses>>(EXPENSES_API_URL);
    return response.data;
};

const createExpense = async (expense: IExpense): Promise<ApiResponse<IExpense>> => {
    const response = await axiosInstance.post<ApiResponse<IExpense>>(EXPENSES_API_URL, expense);
    return response.data;
};

const updateExpense = async (id: string, expense: Partial<IExpense>): Promise<ApiResponse<IExpense>> => {
    const response = await axiosInstance.put<ApiResponse<IExpense>>(`${EXPENSES_API_URL}/${id}`, expense);
    return response.data;
};

const deleteExpense = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`${EXPENSES_API_URL}/${id}`);
    return response.data;
};

export default { getCurrentExpenses, createExpense, updateExpense, deleteExpense };
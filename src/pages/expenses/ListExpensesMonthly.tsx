import React, { useEffect, useState } from 'react';
import expenseService from '../../services/expenseService';
import { IMonthlyExpenses } from 'budget-system-shared';
import { Table, Container, Spinner, Alert } from 'react-bootstrap';

const ListExpensesMonthly: React.FC = () => {
    const [monthlyExpenses, setMonthlyExpenses] = useState<IMonthlyExpenses | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const response = await expenseService.getCurrentExpenses();
                if (!response.success && response.errors && response.errors.length > 0) {
                    alert(response.errors[0]);
                }
                setMonthlyExpenses(response.data ?? null);
            } catch (err) {
                setError('Failed to fetch expenses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!monthlyExpenses || !monthlyExpenses.expenses) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">No expenses found.</Alert>
            </Container>
        );
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Monthly Expenses</h1>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Entered By</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyExpenses.expenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordena por data decrescente
                        .map((expense) => (
                            <tr key={expense._id}>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                <td>{expense.description || 'N/A'}</td>
                                <td>${expense.amount.toFixed(2)}</td>
                                <td>{expense.category.name}</td>
                                <td>{expense.subcategory.name}</td>
                                <td>{expense.updatedBy || expense.createdBy || 'Unknown'}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            <h2 className="mt-5">Summary</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Budget Amount</th>
                        <th>Expenses Amount</th>
                        <th>Available</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Linha de orçamento geral */}
                    <tr>
                        <td>{`${currentYear}/${currentMonth}`}</td>
                        <td>${monthlyExpenses.monthlyBudgetAmount.toFixed(2)}</td>
                        <td>${monthlyExpenses.monthlyBudgetExpensesAmount.toFixed(2)}</td>
                        <td>
                            $
                            {(
                                monthlyExpenses.monthlyBudgetAmount -
                                monthlyExpenses.monthlyBudgetExpensesAmount
                            ).toFixed(2)}
                        </td>
                    </tr>

                    {/* Linhas de categorias */}
                    {monthlyExpenses.categories.map((category) => {
                        const categoryExpenses = monthlyExpenses.expensesByCategory.find(
                            (cat) => cat._id === category._id
                        );

                        return (
                            <React.Fragment key={category._id}>
                                <tr>
                                    <td>{category.name}</td>
                                    <td>${categoryExpenses?.categoryBudget.toFixed(2) || '0.00'}</td>
                                    <td>${categoryExpenses?.categoryExpensesAmount.toFixed(2) || '0.00'}</td>
                                    <td>
                                        $
                                        {(
                                            (categoryExpenses?.categoryBudget || 0) -
                                            (categoryExpenses?.categoryExpensesAmount || 0)
                                        ).toFixed(2)}
                                    </td>
                                </tr>

                                {/* Linhas de subcategorias */}
                                {category.subcategories.map((subcategory) => {
                                    const subcategoryExpenses = monthlyExpenses.expensesBySubcategory.find(
                                        (subcat) => subcat._id === subcategory._id
                                    );

                                    return (
                                        <tr key={subcategory._id}>
                                            <td style={{ paddingLeft: '20px' }}>{subcategory.name}</td>
                                            <td>
                                                ${subcategoryExpenses?.subcategoryBudget.toFixed(2) || '0.00'}
                                            </td>
                                            <td>
                                                ${subcategoryExpenses?.subcategoryExpensesAmount.toFixed(2) || '0.00'}
                                            </td>
                                            <td>
                                                $
                                                {(
                                                    (subcategoryExpenses?.subcategoryBudget || 0) -
                                                    (subcategoryExpenses?.subcategoryExpensesAmount || 0)
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Table>
        </Container>
    );
};

export default ListExpensesMonthly;
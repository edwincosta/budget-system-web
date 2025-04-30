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
                                <td>{typeof expense.category === 'string' ? "" : expense.category.name}</td>
                                <td>{typeof expense.subcategory === 'string' ? "" : expense.subcategory.name}</td>
                                <td>{expense.updatedBy || expense.createdBy || 'Unknown'}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default ListExpensesMonthly;
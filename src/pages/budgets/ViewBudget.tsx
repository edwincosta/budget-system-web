import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Container, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IMonthlyBudget, IMonthlyBudgetCategory } from 'budget-system-shared';
import { FormatBrazilCurrency, FormatDate } from '../../components/Utils';

const ViewBudget: React.FC = () => {
    const { budgetId } = useParams<{ budgetId: string }>();
    const navigate = useNavigate();

    const [monthlyBudget, setMonthlyBudget] = useState<IMonthlyBudget | null>(null);
    const [categories, setCategories] = useState<IMonthlyBudgetCategory[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IMonthlyBudget>>(`/budgets/${budgetId}`);
                if (response.data.success && response.data.data) {
                    setMonthlyBudget(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch budget details.');
                }
            } catch (error) {
                console.error('Error fetching budget details:', error);
                setError('An error occurred while fetching the budget details.');
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IMonthlyBudgetCategory[]>>(
                    `/budgets/${budgetId}/categories`
                );
                if (response.data.success) {
                    setCategories(response.data.data || []);
                } else {
                    setError(response.data.message || 'Failed to fetch categories.');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('An error occurred while fetching the categories.');
            }
        };

        fetchBudget();
        fetchCategories();
    }, [budgetId]);

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">View Budget</h1>
                </Col>
            </Row>
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}
            {monthlyBudget && (
                <>
                    <Row className="mb-4">
                        <Col md={{ span: 6, offset: 3 }}>
                            <Table bordered>
                                <tbody>
                                    <tr>
                                        <th>Month</th>
                                        <td>{monthlyBudget.month}</td>
                                    </tr>
                                    <tr>
                                        <th>Year</th>
                                        <td>{monthlyBudget.year}</td>
                                    </tr>
                                    <tr>
                                        <th>Budget</th>
                                        <td><FormatBrazilCurrency currencyValue={monthlyBudget.budget} /></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Categories</h2>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Category Name</th>
                                        <th>Updated By</th>
                                        <th>Updated At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category._id}>
                                            <td>{typeof category.category === 'string' ? category.category : category.category.name}</td>
                                            <td>{category.updatedBy || 'N/A'}</td>
                                            <td><FormatDate value={category.updatedAt} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Back to Budgets
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ViewBudget;
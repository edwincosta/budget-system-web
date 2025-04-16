import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IMonthlyBudget } from 'budget-system-shared';

const CreateBudget: React.FC = () => {
    const [searchParams] = useSearchParams();
    const forecastId = searchParams.get('forecastId') || '';
    const navigate = useNavigate();

    const [monthlyBudget, setMonthlyBudget] = useState<IMonthlyBudget>({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        budget: 0,
        forecast: forecastId,
        isActive: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMonthlyBudget({ ...monthlyBudget, [name]: name === 'budget' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!forecastId) {
            setError('Forecast ID is missing.');
            return;
        }

        if (monthlyBudget.budget <= 0) {
            setError('Budget must be a positive number.');
            return;
        }

        try {
            const response = await axiosInstance.post<ApiResponse<IMonthlyBudget>>('/budgets', monthlyBudget);
            if (response.data.success) {
                setSuccess('Budget created successfully!');
                setTimeout(() => navigate(`/budgets?forecastId=${forecastId}`), 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message || 'Failed to create budget.');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
            setError('An error occurred while creating the budget.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Create Budget</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Month</Form.Label>
                            <Form.Control
                                type="number"
                                name="month"
                                value={monthlyBudget.month}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="12"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                type="number"
                                name="year"
                                value={monthlyBudget.year}
                                onChange={handleInputChange}
                                required
                                min={new Date().getFullYear()}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control
                                type="number"
                                name="budget"
                                value={monthlyBudget.budget}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Create Budget
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateBudget;
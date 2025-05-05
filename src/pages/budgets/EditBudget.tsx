import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert, Table } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IMonthlyBudget, IMonthlyBudgetCategory, ICategory } from 'budget-system-shared';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { MaskBrazilCurrencyInput } from '../../components/Utils';

const EditBudget: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const forecastId = searchParams.get('forecastId') || user?.defaultForecast || '';
    const { budgetId } = useParams<{ budgetId: string }>();
    const navigate = useNavigate();

    const [monthlyBudget, setMonthlyBudget] = useState<IMonthlyBudget | null>(null);
    const [categories, setCategories] = useState<IMonthlyBudgetCategory[]>([]);
    const [allCategories, setAllCategories] = useState<ICategory[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch the budget and related categories
    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IMonthlyBudget>>(`${config.budgetBaseUrl}/${budgetId}`);
                if (response.data.success && response.data.data) {
                    setMonthlyBudget(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch budget.');
                }
            } catch (error) {
                console.error('Error fetching budget:', error);
                setError('An error occurred while fetching the budget.');
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IMonthlyBudgetCategory[]>>(
                    `${config.budgetBaseUrl}/${budgetId}/categories`
                );
                if (response.data.success) {
                    setCategories(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('An error occurred while fetching categories.');
            }
        };

        const fetchAllCategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ICategory[]>>(`${config.categoryBaseUrl}?forecastId=${forecastId}`);
                if (response.data.success) {
                    setAllCategories(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching all categories:', error);
                setError('An error occurred while fetching all categories.');
            }
        };

        fetchBudget();
        fetchCategories();
        fetchAllCategories();
    }, [budgetId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!monthlyBudget || name === 'budget') return;
        setMonthlyBudget({ ...monthlyBudget, [name]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!monthlyBudget) return;

        if (monthlyBudget.budget <= 0) {
            setError('Budget must be a positive number.');
            return;
        }

        try {
            const response = await axiosInstance.put<ApiResponse<IMonthlyBudget>>(`${config.budgetBaseUrl}/${budgetId}`, monthlyBudget);
            if (response.data.success) {
                setSuccess('Budget updated successfully!');
            } else {
                setError(response.data.message || 'Failed to update budget.');
            }
        } catch (error) {
            console.error('Error updating budget:', error);
            setError('An error occurred while updating the budget.');
        }
    };

    const handleAddCategory = async (categoryId: string) => {
        try {
            const response = await axiosInstance.post<ApiResponse<IMonthlyBudgetCategory>>(`${config.budgetBaseUrl}/categories`, {
                monthlyBudget: budgetId,
                category: categoryId,
            });
            if (response.data.success && response.data.data) {
                setCategories([...categories, response.data.data]);
                setSuccess('Category added successfully!');
            } else {
                setError(response.data.message || 'Failed to add category.');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            setError('An error occurred while adding the category.');
        }
    };

    const handleRemoveCategory = async (categoryId: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `/monthly-budget-categories/${categoryId}`
            );
            if (response.data.success) {
                setCategories(categories.filter((cat) => cat.category !== categoryId));
                setSuccess('Category removed successfully!');
            } else {
                setError(response.data.message || 'Failed to remove category.');
            }
        } catch (error) {
            console.error('Error removing category:', error);
            setError('An error occurred while removing the category.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Edit Budget</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    {monthlyBudget && (
                        <Form onSubmit={handleSave}>
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
                                <MaskBrazilCurrencyInput
                                    name="budget"
                                    value={monthlyBudget.budget}
                                    entity={monthlyBudget}
                                    setEntity={setMonthlyBudget}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Save Changes
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h2>Categories</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={typeof cat.category === 'string' ? cat.category : cat.category._id}>
                                    <td>{typeof cat.category === 'string' ? allCategories.find(a => a._id == cat.category)?.name : cat.category.name}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveCategory(cat.category as string)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <h3>Add Category</h3>
                    <Form.Select
                        onChange={(e) => handleAddCategory(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {allCategories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
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

export default EditBudget;
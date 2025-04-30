import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, ICategory } from 'budget-system-shared';

const CreateCategory: React.FC = () => {
    const [searchParams] = useSearchParams();
    const forecastId = searchParams.get('forecastId') || '';
    const navigate = useNavigate();

    const [category, setCategory] = useState<ICategory>({
        name: '',
        categoryBudget: 0,
        isActive: true,
        forecast: forecastId,
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: name === 'categoryBudget' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!category.forecast) {
            setError('Forecast ID is missing.');
            return;
        }

        if (category.categoryBudget <= 0) {
            setError('Budget must be a positive number.');
            return;
        }

        try {
            const response = await axiosInstance.post<ApiResponse<ICategory>>('/categories', category);
            if (response.data.success) {
                setSuccess('Category created successfully!');
                setTimeout(() => navigate(`/categories?forecastId=${forecastId}`), 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message || 'Failed to create category.');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setError('An error occurred while creating the category.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Create Category</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={category.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control
                                type="number"
                                name="categoryBudget"
                                value={category.categoryBudget}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Create Category
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateCategory;
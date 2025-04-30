import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { ApiResponse, ICategory } from 'budget-system-shared';

const Categories: React.FC = () => {
    const { forecastId, budgetId } = useParams<{ forecastId: string; budgetId: string }>();
    const emptyNewCategory: ICategory = {
        name: '',
        categoryBudget: 0,
        isActive: true,
        forecast: forecastId || '',
    };

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [newCategory, setNewCategory] = useState<ICategory>(emptyNewCategory);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (forecastId && budgetId) {
            fetchCategories(forecastId, budgetId);
        }
    }, [forecastId, budgetId]);

    const fetchCategories = async (forecastId: string, budgetId: string) => {
        try {
            const response = await axiosInstance.get<ApiResponse<ICategory[]>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories`
            );
            if (response.data.success && response.data.data) {
                setCategories(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch categories');
            }
        } catch (error) {
            setError('An error occurred while fetching categories');
            console.error('Error fetching categories:', error);
        }
    };

    const handleCreateCategory = async () => {
        try {
            const response = await axiosInstance.post<ApiResponse<ICategory>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories`,
                { ...newCategory, budget: budgetId }
            );
            if (response.data.success && response.data.data) {
                setCategories([...categories, response.data.data]);
                setNewCategory(emptyNewCategory);
                setIsModalOpen(false);
            } else {
                alert(response.data.message || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('An error occurred while creating the category');
        }
    };

    const handleUpdateCategory = async () => {
        if (!selectedCategoryId) return;
        try {
            const response = await axiosInstance.put<ApiResponse<ICategory>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${selectedCategoryId}`,
                newCategory
            );
            if (response.data.success && response.data.data) {
                const updatedCategory = response.data.data;

                setCategories(
                    categories.map((category) =>
                        category._id === selectedCategoryId ? updatedCategory : category
                    )
                );
                setIsModalOpen(false);
            } else {
                alert(response.data.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('An error occurred while updating the category');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${id}`
            );
            if (response.data.success) {
                setCategories(categories.filter((category) => category._id !== id));
            } else {
                alert(response.data.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('An error occurred while deleting the category');
        }
    };

    const openCreateModal = () => {
        setNewCategory(emptyNewCategory);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (category: ICategory) => {
        setNewCategory(category);
        setSelectedCategoryId(category._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleViewSubcategories = (categoryId: string) => {
        navigate(`/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}/subcategories`);
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Categories</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col className="text-end">
                    <Button variant="primary" onClick={openCreateModal}>
                        Create Category
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {error && <p className="text-danger">{error}</p>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>${category.categoryBudget}</td>
                                    <td>
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => openEditModal(category)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="me-2"
                                            onClick={() => handleDeleteCategory(category._id!)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleViewSubcategories(category._id!)}
                                        >
                                            View Subcategories
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Category' : 'Create Category'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="categoryBudget"
                                value={newCategory.categoryBudget}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={isEditMode ? handleUpdateCategory : handleCreateCategory}
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Categories;
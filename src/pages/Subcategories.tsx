import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { ApiResponse, ICategory, ISubcategory } from 'budget-system-shared';

const Subcategories: React.FC = () => {
    const { forecastId, budgetId, categoryId } = useParams<{
        forecastId: string;
        budgetId: string;
        categoryId: string;
    }>();

    const emptyNewSubcategory: ISubcategory = {
        name: '',
        subcategoryBudget: 0,
        category: categoryId || '',
        isActive: true,
    };

    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [category, setCategory] = useState<ICategory | null>(null);
    const [newSubcategory, setNewSubcategory] = useState<ISubcategory>(emptyNewSubcategory);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (forecastId && budgetId && categoryId) {
            fetchCategory(forecastId, budgetId, categoryId);
            fetchSubcategories(forecastId, budgetId, categoryId);
        }
    }, [forecastId, budgetId, categoryId]);

    const fetchCategory = async (forecastId: string, budgetId: string, categoryId: string) => {
        try {
            const response = await axiosInstance.get<ApiResponse<ICategory>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}`
            );
            if (response.data.success && response.data.data) {
                setCategory(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch category');
            }
        } catch (error) {
            setError('An error occurred while fetching the category');
            console.error('Error fetching category:', error);
        }
    };

    const fetchSubcategories = async (forecastId: string, budgetId: string, categoryId: string) => {
        try {
            const response = await axiosInstance.get<ApiResponse<ISubcategory[]>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}/subcategories`
            );
            if (response.data.success && response.data.data) {
                setSubcategories(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch subcategories');
            }
        } catch (error) {
            setError('An error occurred while fetching subcategories');
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleCreateSubcategory = async () => {
        try {
            const response = await axiosInstance.post<ApiResponse<ISubcategory>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}/subcategories`,
                { ...newSubcategory, category: categoryId }
            );
            if (response.data.success && response.data.data) {
                setSubcategories([...subcategories, response.data.data]);
                setNewSubcategory(emptyNewSubcategory);
                setIsModalOpen(false);
            } else {
                alert(response.data.message || 'Failed to create subcategory');
            }
        } catch (error) {
            console.error('Error creating subcategory:', error);
            alert('An error occurred while creating the subcategory');
        }
    };

    const handleUpdateSubcategory = async () => {
        if (!selectedSubcategoryId) return;
        try {
            const response = await axiosInstance.put<ApiResponse<ISubcategory>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}/subcategories/${selectedSubcategoryId}`,
                newSubcategory
            );
            if (response.data.success && response.data.data) {
                const updatedSubcategory = response.data.data;

                setSubcategories(
                    subcategories.map((subcategory) =>
                        subcategory._id === selectedSubcategoryId ? updatedSubcategory : subcategory
                    )
                );
                setIsModalOpen(false);
            } else {
                alert(response.data.message || 'Failed to update subcategory');
            }
        } catch (error) {
            console.error('Error updating subcategory:', error);
            alert('An error occurred while updating the subcategory');
        }
    };

    const handleDeleteSubcategory = async (id: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `/forecasts/${forecastId}/budgets/${budgetId}/categories/${categoryId}/subcategories/${id}`
            );
            if (response.data.success) {
                setSubcategories(subcategories.filter((subcategory) => subcategory._id !== id));
            } else {
                alert(response.data.message || 'Failed to delete subcategory');
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            alert('An error occurred while deleting the subcategory');
        }
    };

    const openCreateModal = () => {
        setNewSubcategory(emptyNewSubcategory);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (subcategory: ISubcategory) => {
        setNewSubcategory(subcategory);
        setSelectedSubcategoryId(subcategory._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSubcategory({ ...newSubcategory, [name]: value });
    };

    const totalAmount = subcategories.reduce((total, subcategory) => total + subcategory.subcategoryBudget, 0);
    const totalAvailable = (category?.categoryBudget ?? 0) - totalAmount;

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Subcategories</h1>
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h3 className="text-start">{category?.name}</h3>
                </Col>
                <Col>
                    <h3 className="text-end">${category?.categoryBudget}</h3>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col className="text-end">
                    <Button variant="primary" onClick={openCreateModal}>
                        Create Subcategory
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
                            {subcategories.map((subcategory) => (
                                <tr key={subcategory._id}>
                                    <td>{subcategory.name}</td>
                                    <td>${subcategory.subcategoryBudget}</td>
                                    <td>
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => openEditModal(subcategory)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteSubcategory(subcategory._id!)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2} className="text-end">
                                    <strong>Total Amount:</strong>
                                </td>
                                <td colSpan={2}>
                                    <strong>${totalAmount}</strong>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="text-end">
                                    <strong>Available Amount:</strong>
                                </td>
                                <td colSpan={2}>
                                    <strong>${totalAvailable}</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                </Col>
            </Row>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Subcategory' : 'Create Subcategory'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newSubcategory.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="subcategoryBudget"
                                value={newSubcategory.subcategoryBudget}
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
                        onClick={isEditMode ? handleUpdateSubcategory : handleCreateSubcategory}
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Subcategories;
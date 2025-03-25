import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { Budget } from '../models/Budget';
import { Category } from '../models/Category';

const Categories: React.FC = () => {
    const { budgetId } = useParams<{ budgetId: string }>();
    const emptyNewCategory: Category = {
        name: '',
        budget: budgetId || '',
        amount: 0,
        subcategories: []
    };

    const [budget, setBudget] = useState<Budget | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState<Category>(emptyNewCategory);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (budgetId) {
            fetchBudget(budgetId);
        }
    }, [budgetId]);

    useEffect(() => {
        if (budgetId) {
            fetchCategories(budgetId);
        }
    }, [budgetId]);

    const fetchBudget = async (budgetId: string) => {
        try {
            const response = await axiosInstance.get<Budget>(`/budgets/${budgetId}`);
            setBudget(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchCategories = async (budgetId: string) => {
        try {
            const response = await axiosInstance.get<Category[]>(`/categories?budget=${budgetId}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCreateCategory = async () => {
        try {
            const response = await axiosInstance.post<Category>('/categories', { ...newCategory, budget: budgetId });
            setCategories([...categories, response.data]);
            setNewCategory(emptyNewCategory);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleUpdateCategory = async () => {
        if (!selectedCategoryId) return;
        try {
            const response = await axiosInstance.put<Category>(`/categories/${selectedCategoryId}`, newCategory);
            setCategories(categories.map(category => (category._id === selectedCategoryId ? response.data : category)));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await axiosInstance.delete(`/categories/${id}`);
            setCategories(categories.filter(category => category._id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openCreateModal = () => {
        setNewCategory(emptyNewCategory);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setNewCategory(category);
        setSelectedCategoryId(category._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleViewSubcategories = (categoryId: string) => {
        navigate(`/subcategories/${categoryId}`);
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h2 className="text-center">Categories</h2>
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h3 className="text-start">{budget?.type} - {budget?.month}/{budget?.year}</h3>
                </Col>
                <Col>
                    <h3 className="text-end">{budget?.amount}</h3>
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
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category.amount}</td>
                                    <td>
                                        <Button variant="secondary" className="me-2" onClick={() => openEditModal(category)}>Edit</Button>
                                        <Button variant="danger" className="me-2" onClick={() => handleDeleteCategory(category._id!)}>Delete</Button>
                                        <Button variant="info" onClick={() => handleViewSubcategories(category._id!)}>View Subcategories</Button>
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
                                name="amount"
                                value={newCategory.amount}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={isEditMode ? handleUpdateCategory : handleCreateCategory}>
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Categories;
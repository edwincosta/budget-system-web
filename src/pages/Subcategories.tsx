import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { Category } from '../models/Category';
import { Subcategory } from '../models/Subcategory';

const Subcategories: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const emptyNewSubcategory: Subcategory = {
        name: '',
        amount: 0,
        isPersonal: false,
        category: categoryId || ''
    };

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [newSubcategory, setNewSubcategory] = useState<Subcategory>(emptyNewSubcategory);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (categoryId) {
            fetchCategory(categoryId);
        }
    }, [categoryId]);

    useEffect(() => {
        if (categoryId) {
            fetchSubcategories(categoryId);
        }
    }, [categoryId]);

    const fetchCategory = async (categoryId: string) => {
        try {
            const response = await axiosInstance.get<Category>(`/categories/${categoryId}`);
            setCategory(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const response = await axiosInstance.get<Subcategory[]>(`/categories/${categoryId}/subcategories`);
            setSubcategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleCreateSubcategory = async () => {
        try {
            const response = await axiosInstance.post<Subcategory>(`/categories/${categoryId}/subcategories`, { ...newSubcategory, category: categoryId });
            setSubcategories([...subcategories, response.data]);
            setNewSubcategory(emptyNewSubcategory);
            setIsModalOpen(false);
            if (categoryId) {
                fetchSubcategories(categoryId);
            }
        } catch (error) {
            console.error('Error creating subcategory:', error);
        }
    };

    const handleUpdateSubcategory = async () => {
        if (!selectedSubcategoryId) return;
        try {
            const response = await axiosInstance.put<Subcategory>(`/categories/subcategories/${selectedSubcategoryId}`, newSubcategory);
            setSubcategories(subcategories.map(subcategory => (subcategory._id === selectedSubcategoryId ? response.data : subcategory)));
            setIsModalOpen(false);
            if (categoryId) {
                fetchSubcategories(categoryId);
            }
        } catch (error) {
            console.error('Error updating subcategory:', error);
        }
    };

    const handleDeleteSubcategory = async (id: string) => {
        try {
            await axiosInstance.delete(`/categories/subcategories/${id}`);
            setSubcategories(subcategories.filter(subcategory => subcategory._id !== id));
            if (categoryId) {
                fetchSubcategories(categoryId);
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error);
        }
    };

    const openCreateModal = () => {
        setNewSubcategory(emptyNewSubcategory);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (subcategory: Subcategory) => {
        setNewSubcategory(subcategory);
        setSelectedSubcategoryId(subcategory._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewSubcategory({ ...newSubcategory, [name]: value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setNewSubcategory({ ...newSubcategory, [name]: checked });
    };

    const totalAmount = subcategories.reduce((total, subcategory) => total + subcategory.amount, 0);
    const totalAvailable = (category?.amount ?? 0) - totalAmount;

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Subcategories</h1>
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
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <td colSpan={3} className="text-end"><strong>{category?.name}</strong></td>
                                <td><strong>{category?.amount}</strong></td>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Is Personal</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.map(subcategory => (
                                <tr key={subcategory._id}>
                                    <td>{subcategory.name}</td>
                                    <td>{subcategory.amount}</td>
                                    <td>{subcategory.isPersonal ? 'Yes' : 'No'}</td>
                                    <td>
                                        <Button variant="secondary" className="me-2" onClick={() => openEditModal(subcategory)}>Edit</Button>
                                        <Button variant="danger" onClick={() => handleDeleteSubcategory(subcategory._id!)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="text-end"><strong>Total Amount:</strong></td>
                                <td><strong>{totalAmount}</strong></td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-end"><strong>Available Amount:</strong></td>
                                <td><strong>{totalAvailable}</strong></td>
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
                                name="amount"
                                value={newSubcategory.amount}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Is Personal"
                                name="isPersonal"
                                checked={newSubcategory.isPersonal}
                                onChange={handleCheckboxChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={isEditMode ? handleUpdateSubcategory : handleCreateSubcategory}>
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Subcategories;
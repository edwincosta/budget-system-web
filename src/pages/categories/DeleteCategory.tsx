import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Alert, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, ICategory } from 'budget-system-shared';

const DeleteCategory: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [category, setCategory] = useState<ICategory | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(true);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ICategory>>(`/categories/${categoryId}`);
                if (response.data.success && response.data.data) {
                    setCategory(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch category details.');
                }
            } catch (error) {
                console.error('Error fetching category details:', error);
                setError('An error occurred while fetching the category details.');
            }
        };

        fetchBudget();
    }, [categoryId]);

    const handleDelete = async () => {
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`/categories/${categoryId}`);
            if (response.data.success) {
                setSuccess('Category deleted successfully!');
                setTimeout(() => navigate('/categories'), 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message || 'Failed to delete category.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('An error occurred while deleting the category.');
        }
    };

    const handleClose = () => {
        setShowModal(false);
        navigate(-1); // Go back to the previous page
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Delete Category</h1>
                </Col>
            </Row>
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}
            {success && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="success">{success}</Alert>
                    </Col>
                </Row>
            )}
            {category && (
                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete the category for <strong>{category.name}</strong> with a budget of <strong>${category.categoryBudget}</strong>?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default DeleteCategory;
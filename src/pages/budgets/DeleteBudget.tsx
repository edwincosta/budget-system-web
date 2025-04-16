import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Alert, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IMonthlyBudget } from 'budget-system-shared';

const DeleteBudget: React.FC = () => {
    const { budgetId } = useParams<{ budgetId: string }>();
    const navigate = useNavigate();

    const [monthlyBudget, setMonthlyBudget] = useState<IMonthlyBudget | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(true);

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

        fetchBudget();
    }, [budgetId]);

    const handleDelete = async () => {
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`/budgets/${budgetId}`);
            if (response.data.success) {
                setSuccess('Budget deleted successfully!');
                setTimeout(() => navigate('/budgets'), 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message || 'Failed to delete budget.');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            setError('An error occurred while deleting the budget.');
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
                    <h1 className="text-center">Delete Budget</h1>
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
            {monthlyBudget && (
                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete the budget for <strong>{monthlyBudget.month}/{monthlyBudget.year}</strong> with a budget of <strong>${monthlyBudget.budget}</strong>?
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

export default DeleteBudget;
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi'; // Importa os ícones
import { Button, Table, Alert, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IMonthlyBudget } from 'budget-system-shared';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { FormatBrazilCurrency } from '../../components/Utils';

const ListBudgets: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const forecastId = searchParams.get('forecastId') || user?.defaultForecast || '';
    const navigate = useNavigate();

    const [budgets, setBudgets] = useState<IMonthlyBudget[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                console.log('Fetching budgets for forecastId:', forecastId);
                const response = await axiosInstance.get<ApiResponse<IMonthlyBudget[]>>(
                    `/budgets?forecastId=${forecastId}`
                );
                if (response.data.success && response.data.data) {
                    setBudgets(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch budgets.');
                }
            } catch (error) {
                console.error('Error fetching budgets:', error);
                setError('An error occurred while fetching the budgets.');
            }
        };

        fetchBudgets();
    }, [forecastId]);

    const handleDelete = async (budgetId: string) => {
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`/budgets/${budgetId}`);
            if (response.data.success) {
                setSuccess('Budget deleted successfully!');
                setBudgets(budgets.filter((budget) => budget._id !== budgetId));
            } else {
                setError(response.data.message || 'Failed to delete budget.');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            setError('An error occurred while deleting the budget.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h3 className="text-center">Budgets</h3>
                    <h3 className="text-center">{budgets.length > 0 && typeof budgets[0].forecast !== 'string' ? budgets[0].forecast?.name : ""}</h3>
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
            <Row className="mb-4">
                <Col className="text-end">
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/budgets/create?forecastId=${forecastId}`)}
                    >
                        Create New Budget
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((budget) => (
                                <tr key={budget._id}>
                                    <td>{budget.month}</td>
                                    <td>{budget.year}</td>
                                    <td><FormatBrazilCurrency currencyValue={budget.budget}/></td>
                                    <td>
                                        {/* Botão de Visualizar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-view-${budget._id}`}>View</Tooltip>}
                                        >
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`/budgets/${budget._id}`)}
                                            >
                                                <FiEye />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Editar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-edit-${budget._id}`}>Edit</Tooltip>}
                                        >
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`/budgets/${budget._id}/edit?forecastId=${forecastId}`)}
                                            >
                                                <FiEdit />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Excluir */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-delete-${budget._id}`}>Delete</Tooltip>}
                                        >
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(budget._id!)}
                                            >
                                                <FiTrash />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(`${config.forecastBaseUrl}`)}>
                        Back to Forecasts
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ListBudgets;
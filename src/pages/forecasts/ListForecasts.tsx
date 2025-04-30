import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi'; // Importa os ícones
import { Button, Table, Alert, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IForecast } from 'budget-system-shared';
import config from '../../config';

const ListForecasts: React.FC = () => {
    const navigate = useNavigate();

    const [forecasts, setForecasts] = useState<IForecast[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchForecasts = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IForecast[]>>(config.forecastBaseUrl);
                if (response.data.success && response.data.data) {
                    setForecasts(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch forecasts.');
                }
            } catch (error) {
                console.error('Error fetching forecasts:', error);
                setError('An error occurred while fetching the forecasts.');
            }
        };

        fetchForecasts();
    }, []);

    const handleDelete = async (forecastId: string) => {
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`${config.forecastBaseUrl}/${forecastId}`);
            if (response.data.success) {
                setSuccess('Forecast deleted successfully!');
                setForecasts(forecasts.filter((forecast) => forecast._id !== forecastId));
            } else {
                setError(response.data.message || 'Failed to delete forecast.');
            }
        } catch (error) {
            console.error('Error deleting forecast:', error);
            setError('An error occurred while deleting the forecast.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h3 className="text-center">Forecasts</h3>
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
                        onClick={() => navigate(`${config.forecastBaseUrl}/create`)}
                    >
                        Create New Forecast
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.map((forecast) => (
                                <tr key={forecast._id}>
                                    <td>{forecast.name}</td>
                                    <td>
                                        {/* Botão de Visualizar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-view-${forecast._id}`}>Budgets</Tooltip>}
                                        >
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`${config.budgetBaseUrl}?forecastId=${forecast._id}`)}
                                            >
                                                <FiEye />
                                            </Button>
                                        </OverlayTrigger>

                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-view-${forecast._id}`}>Categories</Tooltip>}
                                        >
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`${config.categoryBaseUrl}?forecastId=${forecast._id}`)}
                                            >
                                                <FiEye />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Editar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-edit-${forecast._id}`}>Edit</Tooltip>}
                                        >
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`${config.forecastBaseUrl}/${forecast._id}/edit`)}
                                            >
                                                <FiEdit />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Excluir */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-delete-${forecast._id}`}>Delete</Tooltip>}
                                        >
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(forecast._id!)}
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
        </Container>
    );
};

export default ListForecasts;
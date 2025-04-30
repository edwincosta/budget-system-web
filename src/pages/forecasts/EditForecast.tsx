import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert, Table } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IForecast, IUser, IUserForecast } from 'budget-system-shared';
import config from '../../config';

const EditForecast: React.FC = () => {
    const { forecastId } = useParams<{ forecastId: string }>();
    const navigate = useNavigate();

    const [forecast, setForecast] = useState<IForecast | null>(null);
    const [users, setUsers] = useState<IUserForecast[]>([]);
    const [allUsers, setAllUsers] = useState<IUser[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch the budget and related categories
    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IForecast>>(`${config.forecastBaseUrl}/${forecastId}`);
                if (response.data.success && response.data.data) {
                    setForecast(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch forecast.');
                }
            } catch (error) {
                console.error('Error fetching forecast:', error);
                setError('An error occurred while fetching the forecast.');
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IUserForecast[]>>(
                    `${config.forecastBaseUrl}/${forecastId}/users`
                );
                if (response.data.success) {
                    setUsers(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching forecast users:', error);
                setError('An error occurred while fetching forecast users.');
            }
        };

        const fetchAllCategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<IUser[]>>(config.userBaseUrl);
                if (response.data.success) {
                    setAllUsers(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching all users:', error);
                setError('An error occurred while fetching all users.');
            }
        };

        fetchForecast();
        fetchUsers();
        fetchAllCategories();
    }, [forecastId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!forecast) return;
        const { name, value } = e.target;
        setForecast({ ...forecast, [name]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!forecast) return;

        try {
            const response = await axiosInstance.put<ApiResponse<IForecast>>(`${config.forecastBaseUrl}/${forecastId}`, forecast);
            if (response.data.success) {
                setSuccess('Forecast updated successfully!');
            } else {
                setError(response.data.message || 'Failed to update forecast.');
            }
        } catch (error) {
            console.error('Error updating forecast:', error);
            setError('An error occurred while updating the forecast.');
        }
    };

    const handleAddUser = async (userId: string) => {
        try {
            const response = await axiosInstance.post<ApiResponse<IUserForecast>>(`${config.forecastBaseUrl}/${forecastId}/user`, {
                forecast: forecastId,
                user: userId,
            });
            if (response.data.success && response.data.data) {
                setUsers([...users, response.data.data]);
                setSuccess('User added successfully!');
            } else {
                setError(response.data.message || 'Failed to add forecast user.');
            }
        } catch (error) {
            console.error('Error adding forecast user:', error);
            setError('An error occurred while adding the forecast user.');
        }
    };

    const handleRemoveUser = async (userForecastId?: string) => {
        if (!userForecastId) return;
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `${config.forecastBaseUrl}/forecastuser/${userForecastId}`
            );
            if (response.data.success) {
                setUsers(users.filter((fuser) => fuser._id?.toString() !== userForecastId));
                setSuccess('Forecast user removed successfully!');
            } else {
                setError(response.data.message || 'Failed to remove forecast user.');
            }
        } catch (error) {
            console.error('Error removing forecast user:', error);
            setError('An error occurred while removing the forecast user.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Edit Forecast</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    {forecast && (
                        <Form onSubmit={handleSave}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={forecast.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Save
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h2>Users</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((fusr) => (
                                <tr key={fusr._id}>
                                    <td>{typeof fusr.user === 'string' ? allUsers.find(a => a._id == fusr.user)?.username : fusr.user.username}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveUser(fusr._id?.toString())}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <h3>Add User</h3>
                    <Form.Select
                        onChange={(e) => handleAddUser(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select a user
                        </option>
                        {allUsers.map((fusr) => (
                            <option key={fusr._id} value={fusr._id}>
                                {fusr.username} | {fusr.personName}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Back to Forecasts
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default EditForecast;
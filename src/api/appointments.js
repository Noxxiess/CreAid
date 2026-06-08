import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL;

  export const markServiceNotPerformedApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/services/${id}/not-performed`
    );

  return response.data;
};

export const markServicePerformedApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/services/${id}/performed`
    );

  return response.data;
};

  export const addServiceToPaymentApi =
async (
  appointmentId,
  serviceId
) => {

  const response =
    await axios.post(
      `${API_URL}/appointments/${appointmentId}/add-service`,
      {
        service_id:
          serviceId
      }
    );

  return response.data;
};

  // services.js
export const getServicesApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/services`
    );

  return response.data;
};

  export const reinstatePaymentApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/${id}/reinstate-payment`
    );

  return response.data;
};

  

  export const confirmDownpaymentApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/${id}/confirm-downpayment`
    );

  return response.data;
};

  export const undoPaymentPaidApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/${id}/undo-paid`
    );

  return response.data;
};

  export const markPaymentPaidApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/${id}/mark-paid`
    );

  return response.data;
};


export const cancelPaymentApi =
async (id) => {

  const response =
    await axios.patch(
      `${API_URL}/appointments/${id}/cancel-payment`
    );

  return response.data;
};

  export const getAppointmentServicesApi =
async (appointmentId) => {

  const response =
    await axios.get(
      `${API_URL}/appointments/${appointmentId}/services`
    );

  return response.data;
};

  export const getPaymentsApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/appointments/payments`
    );

  return response.data;
};

  export const getBalancesApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/appointments/balances`
    );

  return response.data;
};

export const getTreatmentStatsApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/appointments/treatment-stats`
    );

  return response.data;
};

export const getAppointmentStatsApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/appointments/stats`
    );

  return response.data;
};

export const createAppointmentApi =
async (data) => {

  const response =
    await axios.post(
      `${API_URL}/appointments`,
      data
    );

  return response.data;
};

export const getAppointmentsApi =
async () => {

  const response =
    await axios.get(
      `${API_URL}/appointments`
    );

  return response.data;
};

export const updateAppointmentStatusApi = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/appointments/${id}/status`,
    { status }
  );

  return response.data;
};
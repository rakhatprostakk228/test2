const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });

  return query.toString();
}

async function parseError(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error('Server error');
  }

  const validationError = data?.errors
    ? Object.values(data.errors).flat().join(' ')
    : '';

  throw new Error(validationError || data?.message || 'Request failed');
}

/**
 * @param {Object} params - { date?, status?, search?, per_page?, page? }
 * @returns {Promise<{ data: Array, current_page: number, last_page: number, total: number, per_page: number }>}
 */
export async function getBookings(params = {}) {
  const query = buildQuery(params);
  const response = await fetch(`${API_URL}/bookings${query ? `?${query}` : ''}`);

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
}

export async function createBooking(payload) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
}

export async function updateBooking(id, payload) {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
}

export async function updateBookingStatus(id, status) {
  const response = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
}

export async function deleteBooking(id) {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
}

export function getBookingPdfUrl(bookingId) {
  return `${API_URL}/bookings/${bookingId}/pdf`;
}

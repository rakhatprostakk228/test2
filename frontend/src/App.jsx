import { useEffect, useMemo, useState } from 'react';
import {
  createBooking,
  deleteBooking,
  getBookingPdfUrl,
  getBookings,
  updateBooking,
  updateBookingStatus,
} from './api';

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  booking_date: '',
  booking_time: '',
  guests: 1,
  notes: '',
};

const initialFilters = {
  date: '',
  status: '',
  search: '',
};

const PER_PAGE = 10;

const STATUS_LABELS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PER_PAGE });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  async function loadBookings(nextFilters = filters, page = 1) {
    try {
      setLoading(true);
      setError('');
      const params = { ...nextFilters, per_page: PER_PAGE, page };
      const res = await getBookings(params);
      setBookings(res.data || []);
      setPagination({
        current_page: res.current_page ?? 1,
        last_page: res.last_page ?? 1,
        total: res.total ?? 0,
        per_page: res.per_page ?? PER_PAGE,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = { ...form, guests: Number(form.guests) };

      if (editingId) {
        await updateBooking(editingId, payload);
        setSuccess('Бронирование обновлено');
      } else {
        await createBooking(payload);
        setSuccess('Бронирование создано');
      }

      setForm(initialForm);
      setEditingId(null);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name,
      email: item.email,
      phone: item.phone,
      booking_date: item.booking_date,
      booking_time: item.booking_time?.slice(0, 5) || '',
      guests: item.guests,
      notes: item.notes || '',
    });
    setSuccess('');
    setError('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Удалить бронь?')) return;

    try {
      setError('');
      setSuccess('');
      await deleteBooking(id);
      setSuccess('Бронирование удалено');
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatus(id, status) {
    try {
      setError('');
      setSuccess('');
      await updateBookingStatus(id, status);
      setSuccess('Статус обновлен');
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleFilterChange(name, value) {
    const next = { ...filters, [name]: value };
    setFilters(next);
  }

  async function applyFilters(event) {
    event.preventDefault();
    await loadBookings(filters, 1);
  }

  async function resetFilters() {
    setFilters(initialFilters);
    await loadBookings(initialFilters, 1);
  }

  function goToPage(page) {
    if (page < 1 || page > pagination.last_page) return;
    loadBookings(filters, page);
  }

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <main className="page">
      <section className="card">
        <h1>Система бронирования</h1>
        <p>Laravel API + React + PDF</p>

        <form className="form" onSubmit={handleSubmit} aria-label="Форма бронирования">
          <label className="label">
            ФИО
            <input
              placeholder="Иванов Иван Иванович"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              autoComplete="name"
            />
          </label>
          <label className="label">
            Email
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </label>
          <label className="label">
            Телефон
            <input
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              autoComplete="tel"
            />
          </label>
          <div className="row">
            <label className="label">
              Дата брони
              <input
                type="date"
                min={minDate}
                value={form.booking_date}
                onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                required
              />
            </label>
            <label className="label">
              Время
              <input
                type="time"
                value={form.booking_time}
                onChange={(e) => setForm({ ...form, booking_time: e.target.value })}
                required
              />
            </label>
            <label className="label">
              Количество гостей
              <input
                type="number"
                min={1}
                max={20}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                required
              />
            </label>
          </div>
          <label className="label">
            Комментарий
            <textarea
              placeholder="Пожелания по столику, особые требования"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </label>
          <div className="actions">
            <button disabled={saving} type="submit">
              {saving ? 'Сохранение...' : editingId ? 'Сохранить' : 'Создать бронь'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Отмена
              </button>
            )}
          </div>
        </form>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
      </section>

      <section className="card">
        <h2>Список броней</h2>

        <form className="filters" onSubmit={applyFilters} aria-label="Фильтры списка">
          <label className="label">
            Дата
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </label>
          <label className="label">
            Статус
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="confirmed">Подтверждено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </label>
          <label className="label">
            Поиск
            <input
              placeholder="Имя, email, телефон"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </label>
          <button type="submit">Фильтровать</button>
          <button type="button" className="secondary" onClick={resetFilters}>
            Сброс
          </button>
        </form>

        {loading ? (
          <div className="loadingState" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <p>Загрузка...</p>
          </div>
        ) : bookings.length === 0 ? (
          <p className="emptyState">Нет бронирований. Создайте первую бронь выше.</p>
        ) : (
          <>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Клиент</th>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Гостей</th>
                    <th>Статус</th>
                    <th>PDF</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.full_name}</td>
                      <td>{item.booking_date}</td>
                      <td>{item.booking_time?.slice(0, 5)}</td>
                      <td>{item.guests}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        <a href={getBookingPdfUrl(item.id)} target="_blank" rel="noreferrer">
                          Скачать PDF
                        </a>
                      </td>
                      <td>
                        <div className="tableActions">
                          <button type="button" onClick={() => handleEdit(item)} title="Редактировать">
                            Редактировать
                          </button>
                          {item.status !== 'confirmed' && (
                            <button type="button" onClick={() => handleStatus(item.id, 'confirmed')} title="Подтвердить бронь">
                              Подтвердить
                            </button>
                          )}
                          {item.status !== 'cancelled' && (
                            <button type="button" className="secondary" onClick={() => handleStatus(item.id, 'cancelled')} title="Отменить бронь">
                              Отменить
                            </button>
                          )}
                          <button type="button" className="danger" onClick={() => handleDelete(item.id)} title="Удалить бронь">
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.last_page > 1 && (
              <nav className="pagination" aria-label="Пагинация списка броней">
                <span className="paginationInfo">
                  Показано {bookings.length} из {pagination.total}
                </span>
                <div className="paginationButtons">
                  <button
                    type="button"
                    className="secondary"
                    disabled={pagination.current_page <= 1}
                    onClick={() => goToPage(pagination.current_page - 1)}
                  >
                    Назад
                  </button>
                  <span className="pageNum">
                    Страница {pagination.current_page} из {pagination.last_page}
                  </span>
                  <button
                    type="button"
                    className="secondary"
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => goToPage(pagination.current_page + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}

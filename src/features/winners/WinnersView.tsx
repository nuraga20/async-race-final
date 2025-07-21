import React, { useEffect, useState } from 'react';
import { getWinners } from '../../api/winners';
import type { Winner } from '../../api/winners';
import { getCars } from '../../api/cars';

const PAGE_SIZE = 10;

const CarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="40" height="20" viewBox="0 0 40 20" style={{ marginRight: 16 }}>
    <rect x="4" y="8" width="32" height="8" rx="2" fill={color} stroke="#333" strokeWidth="1" />
    <rect x="10" y="4" width="20" height="8" rx="2" fill={color} stroke="#333" strokeWidth="1" />
    <circle cx="10" cy="18" r="2" fill="#FFFFFF" />
    <circle cx="30" cy="18" r="2" fill="#FFFFFF" />
  </svg>
);

interface CarInfo {
  id: number;
  name: string;
  color: string;
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  background: '#f8fafc',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};
const thStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: '2px solid #e2e8f0',
  background: '#e2e8f0',
  fontWeight: 700,
  color: '#22223b',
  textAlign: 'center',
  fontSize: 16,
};
const tdStyle: React.CSSProperties = {
  padding: 10,
  borderBottom: '1px solid #e2e8f0',
  textAlign: 'center',
  fontSize: 15,
  color: '#22223b',
  background: '#fff',
};
const trHoverStyle: React.CSSProperties = {
  background: '#f1f5f9',
};

const WinnersView: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'id' | 'wins' | 'time'>('id');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [loading, setLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { winners, total } = await getWinners(page, PAGE_SIZE, sort, order);
      setWinners(winners);
      setTotal(total);
      // Fetch all cars for name/color lookup
      const allCars: CarInfo[] = [];
      let carPage = 1;
      let more = true;
      while (more) {
        const { cars: pageCars, total: carTotal } = await getCars(carPage, 100);
        allCars.push(...pageCars);
        if (allCars.length >= carTotal) more = false;
        else carPage++;
      }
      setCars(allCars);
      setLoading(false);
    };
    fetchData();
  }, [page, sort, order]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getCarInfo = (id: number) => cars.find((c) => c.id === id);

  const handleSort = (field: 'wins' | 'time') => {
    if (sort === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else {
      setSort(field);
      setOrder('ASC');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ color: '#22223b', marginBottom: 16 }}>Winners</h1>
      <div style={{ marginBottom: '1rem', color: '#4a5568' }}>Total winners: {total}</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>№</th>
              <th style={thStyle}>Car</th>
              <th style={thStyle}>Name</th>
              <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('wins')}>
                Wins {sort === 'wins' ? (order === 'ASC' ? '▲' : '▼') : ''}
              </th>
              <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('time')}>
                Best time (s) {sort === 'time' ? (order === 'ASC' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner, idx) => {
              const car = getCarInfo(winner.id);
              return (
                <tr
                  key={winner.id}
                  style={hoveredRow === winner.id ? trHoverStyle : {}}
                  onMouseEnter={() => setHoveredRow(winner.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={tdStyle}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td style={tdStyle}>{car ? <CarIcon color={car.color} /> : '-'}</td>
                  <td style={tdStyle}>{car ? car.name : '-'}</td>
                  <td style={tdStyle}>{winner.wins}</td>
                  <td style={tdStyle}>{winner.time.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} / {totalPages || 1}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</button>
      </div>
    </div>
  );
};

export default WinnersView; 
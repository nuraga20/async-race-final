import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import GaragePanel from './GaragePanel';
import { fetchCars, setPage, selectCar, removeCar } from './carsSlice';

const BASE_URL = 'http://127.0.0.1:3000';
const TRACK_LENGTH = 600;
const TRACK_HEIGHT = 32;

const CarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="40" height="20" viewBox="0 0 40 20">
    <rect x="4" y="8" width="32" height="8" rx="2" fill={color} stroke="#333" strokeWidth="1" />
    <rect x="10" y="4" width="20" height="8" rx="2" fill={color} stroke="#333" strokeWidth="1" />
    <circle cx="10" cy="18" r="2" fill="#FFFFFF" />
    <circle cx="30" cy="18" r="2" fill="#FFFFFF" />
  </svg>
);

interface CarRaceState {
  position: number;
  duration: number;
  running: boolean;
  finished: boolean;
  error: boolean;
  stopped: boolean;
}

interface RaceState {
  [carId: number]: CarRaceState;
}

const initialCarState: CarRaceState = {
  position: 0,
  duration: 0,
  running: false,
  finished: false,
  error: false,
  stopped: true,
};

const postRaceWinner = async (id: number, time: number) => {
  await fetch('http://127.0.0.1:3000/race-winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, time }),
  });
};

const GarageView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cars, total, page, loading, selectedCar } = useAppSelector((state) => state.cars);
  const totalPages = Math.ceil(total / 7);
  const [raceState, setRaceState] = useState<RaceState>({});
  const [winner, setWinner] = useState<{ id: number; name: string; time: number } | null>(null);
  const raceInProgress = Object.values(raceState).some((s) => s.running);
  const winnerShown = useRef(false);

  useEffect(() => {
    dispatch(fetchCars(page));
    setRaceState({});
    setWinner(null);
    winnerShown.current = false;
  }, [dispatch, page]);

  const handlePrev = () => {
    if (page > 1) dispatch(setPage(page - 1));
  };
  const handleNext = () => {
    if (page < totalPages) dispatch(setPage(page + 1));
  };

  const startRace = async () => {
    setRaceState({});
    setWinner(null);
    winnerShown.current = false;
    const promises = cars.map(async (car) => {
      await handleStartCar(car.id, car.name, true);
    });
    await Promise.all(promises);
  };

  const resetRace = () => {
    setRaceState({});
    setWinner(null);
    winnerShown.current = false;
  };

  const handleStartCar = async (carId: number, carName: string, isRace = false) => {
    setRaceState((prev) => ({
      ...prev,
      [carId]: { ...initialCarState, running: true, stopped: false },
    }));
    try {
      const startRes = await fetch(`${BASE_URL}/engine?id=${carId}&status=started`, { method: 'PATCH' });
      const startData = await startRes.json();
      const driveRes = await fetch(`${BASE_URL}/engine?id=${carId}&status=drive`, { method: 'PATCH' });
      if (!driveRes.ok) throw new Error('Drive failed');
      const duration = Math.round((startData.distance / startData.velocity));
      setRaceState((prev) => ({
        ...prev,
        [carId]: { ...prev[carId], position: TRACK_LENGTH, duration, running: true, finished: false, error: false, stopped: false },
      }));
      await new Promise((resolve) => setTimeout(resolve, duration));
      setRaceState((prev) => ({
        ...prev,
        [carId]: { ...prev[carId], running: false, finished: true, stopped: false },
      }));
      if (!winnerShown.current && isRace) {
        setWinner({ id: carId, name: carName, time: duration / 1000 });
        winnerShown.current = true;
        await postRaceWinner(carId, duration / 1000);
      }
    } catch (e) {
      setRaceState((prev) => ({
        ...prev,
        [carId]: { ...prev[carId], position: 0, duration: 0, running: false, finished: false, error: true, stopped: false },
      }));
    }
  };

  const handleStopCar = async (carId: number) => {
    await fetch(`${BASE_URL}/engine?id=${carId}&status=stopped`, { method: 'PATCH' });
    setRaceState((prev) => ({
      ...prev,
      [carId]: { ...initialCarState, stopped: true },
    }));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Garage</h1>
      <GaragePanel />
      <div style={{ marginBottom: '1rem' }}>
        <button style={{ marginRight: '1rem' }} onClick={startRace} disabled={raceInProgress}>Start Race</button>
        <button style={{ marginRight: '1rem' }} onClick={resetRace}>Reset Race</button>
        <button disabled={raceInProgress}>Create 100 Random Cars</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>Total cars: {total}</div>
      {winner && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', marginBottom: '1rem', borderRadius: 8 }}>
          Winner: {winner.name} ({winner.time.toFixed(2)}s)
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : cars.length === 0 ? (
        <div>No Cars</div>
      ) : (
        <div>
          {cars.map((car) => {
            const state = raceState[car.id] || initialCarState;
            return (
              <div key={car.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', border: selectedCar?.id === car.id ? '2px solid #5390d9' : '1px solid #ccc', padding: '0.5rem', borderRadius: 10, background: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ position: 'relative', width: 420, height: 28, background: '#e2e8f0', borderRadius: 8, marginRight: 16, overflow: 'hidden', flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: Math.max(0, Math.min(state.position, 420 - 40)),
                      top: 4,
                      transition: state.running ? `left ${state.duration}ms linear` : 'none',
                      zIndex: 2,
                    }}
                  >
                    <CarIcon color={car.color} />
                  </div>
                </div>
                <span style={{ flex: 1, minWidth: 60, fontWeight: 500 }}>{car.name}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, marginLeft: 8 }}>
                  <button
                    onClick={() => handleStartCar(car.id, car.name)}
                    style={{ padding: '0.3rem 0.7rem', fontSize: 13, borderRadius: 6, border: '1px solid #bfc9d9', background: '#e2e8f0', fontWeight: 500, color: '#111' }}
                    disabled={state.running || !state.stopped}
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleStopCar(car.id)}
                    style={{ padding: '0.3rem 0.7rem', fontSize: 13, borderRadius: 6, border: '1px solid #bfc9d9', background: '#e2e8f0', fontWeight: 500, color: '#111' }}
                    disabled={state.stopped || state.running}
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => dispatch(selectCar(car))}
                    style={{ padding: '0.3rem 0.7rem', fontSize: 13, borderRadius: 6, border: '1px solid #bfc9d9', background: '#e2e8f0', fontWeight: 500, color: '#111' }}
                    disabled={raceInProgress}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => dispatch(removeCar(car.id))}
                    style={{ padding: '0.3rem 0.7rem', fontSize: 13, borderRadius: 6, border: '1px solid #bfc9d9', background: '#e2e8f0', fontWeight: 500, color: '#111' }}
                    disabled={raceInProgress}
                  >
                    Delete
                  </button>
                </div>
                {state.error && <span style={{ color: 'red', marginLeft: 8 }}>Engine Error</span>}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handlePrev} disabled={page === 1 || raceInProgress}>Prev</button>
        <span>Page {page} / {totalPages || 1}</span>
        <button onClick={handleNext} disabled={page === totalPages || totalPages === 0 || raceInProgress}>Next</button>
      </div>
    </div>
  );
};

export default GarageView; 
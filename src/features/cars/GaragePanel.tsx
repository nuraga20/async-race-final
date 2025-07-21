import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addCar, editCar, selectCar, fetchCars, setPage } from './carsSlice';

const GaragePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedCar = useAppSelector((state) => state.cars.selectedCar);
  const total = useAppSelector((state) => state.cars.total);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (selectedCar) {
      setName(selectedCar.name);
      setColor(selectedCar.color);
    } else {
      setName('');
      setColor('#000000');
    }
  }, [selectedCar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length > 20) return;
    if (selectedCar) {
      dispatch(editCar({ id: selectedCar.id, car: { name, color } }));
      dispatch(selectCar(null));
    } else {
      await dispatch(addCar({ name, color }));
      // After adding, go to last page
      const newTotal = total + 1;
      const lastPage = Math.ceil(newTotal / 7);
      dispatch(setPage(lastPage));
      dispatch(fetchCars(lastPage));
    }
    setName('');
    setColor('#000000');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Car name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        required
        style={{ padding: '0.5rem' }}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ width: '2rem', height: '2rem', border: 'none', background: 'none' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        {selectedCar ? 'Update' : 'Create'}
      </button>
      {selectedCar && (
        <button type="button" onClick={() => dispatch(selectCar(null))} style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default GaragePanel; 
const BASE_URL = 'http://127.0.0.1:3000';

export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface CreateCarDto {
  name: string;
  color: string;
}

export const getCars = async (page = 1, limit = 7): Promise<{ cars: Car[]; total: number }> => {
  const res = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=${limit}`);
  const cars = await res.json();
  const total = Number(res.headers.get('X-Total-Count'));
  return { cars, total };
};

export const createCar = async (car: CreateCarDto): Promise<Car> => {
  const res = await fetch(`${BASE_URL}/garage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  return res.json();
};

export const updateCar = async (id: number, car: CreateCarDto): Promise<Car> => {
  const res = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  return res.json();
};

export const deleteCar = async (id: number): Promise<void> => {
  await fetch(`${BASE_URL}/garage/${id}`, { method: 'DELETE' });
}; 
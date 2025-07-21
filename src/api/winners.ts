const BASE_URL = 'http://127.0.0.1:3000';

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export const getWinners = async (page = 1, limit = 10, sort = 'id', order = 'ASC'): Promise<{ winners: Winner[]; total: number }> => {
  const res = await fetch(`${BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`);
  const winners = await res.json();
  const total = Number(res.headers.get('X-Total-Count'));
  return { winners, total };
};

export const getWinner = async (id: number): Promise<Winner> => {
  const res = await fetch(`${BASE_URL}/winners/${id}`);
  if (!res.ok) throw new Error('Winner not found');
  return res.json();
};

export const createWinner = async (winner: Winner): Promise<Winner> => {
  const res = await fetch(`${BASE_URL}/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
  if (!res.ok) throw new Error('Failed to create winner');
  return res.json();
};

export const updateWinner = async (id: number, winner: Omit<Winner, 'id'>): Promise<Winner> => {
  const res = await fetch(`${BASE_URL}/winners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
  if (!res.ok) throw new Error('Failed to update winner');
  return res.json();
};

export const deleteWinner = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/winners/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete winner');
}; 
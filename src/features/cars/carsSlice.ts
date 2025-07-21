import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getCars, createCar, updateCar, deleteCar } from '../../api/cars';
import type { Car, CreateCarDto } from '../../api/cars';
import type { AppDispatch, RootState } from '../../store';

interface CarsState {
  cars: Car[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  selectedCar: Car | null;
}

const initialState: CarsState = {
  cars: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  selectedCar: null,
};

export const fetchCars = createAsyncThunk(
  'cars/fetchCars',
  async (page: number) => {
    return getCars(page);
  }
);

export const addCar = createAsyncThunk<void, CreateCarDto, { state: RootState; dispatch: AppDispatch }>(
  'cars/addCar',
  async (car, { dispatch, getState }) => {
    await createCar(car);
    dispatch(fetchCars(getState().cars.page));
  }
);

export const editCar = createAsyncThunk<void, { id: number; car: CreateCarDto }, { state: RootState; dispatch: AppDispatch }>(
  'cars/editCar',
  async ({ id, car }, { dispatch, getState }) => {
    await updateCar(id, car);
    dispatch(fetchCars(getState().cars.page));
  }
);

export const removeCar = createAsyncThunk<void, number, { state: RootState; dispatch: AppDispatch }>(
  'cars/removeCar',
  async (id, { dispatch, getState }) => {
    await deleteCar(id);
    dispatch(fetchCars(getState().cars.page));
  }
);

const carsSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    selectCar(state, action: PayloadAction<Car | null>) {
      state.selectedCar = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload.cars;
        state.total = action.payload.total;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cars';
      })
      .addCase(addCar.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editCar.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeCar.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCar.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setPage, selectCar } = carsSlice.actions;
export default carsSlice.reducer; 
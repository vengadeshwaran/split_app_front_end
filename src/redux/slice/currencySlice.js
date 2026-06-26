import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_CURRENCY, getSymbolByName } from "../../constants/currencies";

const saved = localStorage.getItem("appCurrency");
const initial = saved ? JSON.parse(saved) : DEFAULT_CURRENCY;

const currencySlice = createSlice({
  name: "currency",
  initialState: initial,
  reducers: {
    setCurrency: (state, action) => {
      const { name, symbol } = action.payload;
      state.name   = name;
      state.symbol = symbol ?? getSymbolByName(name);
      localStorage.setItem("appCurrency", JSON.stringify({ name: state.name, symbol: state.symbol }));
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;

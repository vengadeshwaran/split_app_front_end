import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    removeSelect: false,
    closeSelect: false,
};

const tableSlice = createSlice({
    name: "table",
    initialState,
    reducers: {
        setTableDetail: (state, action) => {
            const updates = action.payload;
            return {
                ...state,
                ...updates,
            };
        },
    },
});

export const { setTableDetail } = tableSlice.actions;
export default tableSlice.reducer;

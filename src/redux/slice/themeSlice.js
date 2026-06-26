import { createSlice } from "@reduxjs/toolkit";

let color;
try {
    const storedTheme = sessionStorage.getItem("theme");
    color = storedTheme ? JSON.parse(storedTheme) : null;
} catch (error) {
    color = null;
    sessionStorage.setItem("theme", JSON.stringify("light"));
}

if (!color) {
    sessionStorage.setItem("theme", JSON.stringify("light"));
    color = "light";
}

const initialState = {
    theme: color,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            return {
                theme: action.payload,
            };
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;

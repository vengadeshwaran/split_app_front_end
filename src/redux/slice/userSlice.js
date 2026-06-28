import { createSlice } from "@reduxjs/toolkit";

const session = JSON.parse(localStorage.getItem("authUser"));

const initialState = {
    name: session ? session?.name : "",
    token: session ? session?.token : "",
    email: session ? session?.email : "",
    user_id: session ? session?.user_id : "",
    isAuthenticated: session ? session?.isAuthenticated : false,
    login_id: session ? session?.login_id : "",
    is_admin: session ? session?.is_admin || false : false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserState: (state, action) => {
            const updates = action.payload;
            if (updates) {
                const merged = {
                    ...state,
                    ...updates,
                };
                localStorage.setItem("authUser", JSON.stringify(merged));
                return merged;
            }
            return state;
        },

        setLogout: (state, action) => {
            localStorage.removeItem("authUser");
            return {
                name: "",
                token: "",
                email: "",
                user_id: "",
                isAuthenticated: false,
            };
            // Reset the state to the initial state on logout
        },
    },
});

export const { setLogout, setUserState } = userSlice.actions;
export default userSlice.reducer;

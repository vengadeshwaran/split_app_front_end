import { configureStore } from "@reduxjs/toolkit";

import userSlice from "../slice/userSlice";
import tableSlice from "../slice/tableSlice";
import themeSlice from "../slice/themeSlice";
import currencySlice from "../slice/currencySlice";
import chatSlice from "../slice/chatSlice";

export const store = configureStore({
    reducer: {
        user: userSlice,
        theme: themeSlice,
        table: tableSlice,
        currency: currencySlice,
        chat: chatSlice,
    },
});

store.subscribe(() => {
    const { theme } = store.getState();
    sessionStorage.setItem("theme", JSON.stringify(theme.theme));
});

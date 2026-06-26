import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";

import MainRouter from "./router/MainRouter";
// import PageLoader from "./components/Loader/PageLoader";
// import PageNotFound from "./pages/errorpages/PageNotFound";

function Routes(props) {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <RouterRoutes>
                    {MainRouter()}
                    <Route path="*" element={null} />
                </RouterRoutes>
            </Suspense>
        </BrowserRouter>
    );
}
 
export default Routes;
 
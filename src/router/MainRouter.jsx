import React from "react";
import { Route } from "react-router-dom";

import PrivateRoute from "../PrivateRoute";
import LoginLayout from "../layouts/LoginLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/login/LoginPage";
import SignUpPage from "../pages/login/SignUpPage";
import OtpVerificationPage from "../pages/login/OtpVerificationPage";
import CompsamplPage from "../pages/ComponentsSamplePage/CompSamplPage";
import AddBuildForm from "../pages/buildingCrud/AddBuildForm";
import BuildingDetails from "../pages/buildingCrud/BuildingDetails";
import GroupsSplit from "../pages/GroupsSplit";
import FriendsList from "../pages/FriendsList";
import RepaymentRequests from "../pages/RepaymentRequests";
import AuditReports from "../pages/AuditReports";
import UserSettings from "../pages/UserSettings";
import TransactionPage from "../pages/TransactionPage";
import GroupTransactionPage from "../pages/GroupTransactionPage";
import RequestMoneyPage from "../pages/RequestMoneyPage";
import GroupSpliPage from "../pages/GroupSpliPage";
import ExpenseSplitDetailPage from "../pages/ExpenseSplitDetailPage";
import CurrencySettingsPage from "../pages/CurrencySettingsPage";
import CreateGroupPage from "../pages/CreateGroupPage";
import EditGroupPage from "../pages/EditGroupPage";
import PaymentSummaryPage from "../pages/PaymentSummaryPage";


// inside Pages
// const Customer = lazyWithPreload(() => import("../pages/Customer/Customer"));

// function lazyWithPreload(factory) {
//     const Component = lazy(factory);
//     Component.preload = factory;
//     return Component;
// }

const MainRouter = () => [
  /* Login Pages */
  <Route key="login" path="/" element={<LoginLayout />}>
    <Route index element={<LoginPage />} />
    <Route path="signup" element={<SignUpPage />} />
    <Route path="verify" element={<OtpVerificationPage />} />
  </Route>,

  /* Components Sample */
  <Route key="components" path="/components" element={<CompsamplPage />} />,

  /* Inside Pages */
  <Route key="private" element={<PrivateRoute />}>
    <Route element={<DashboardLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups" element={<GroupsSplit />} />
      <Route path="/groups/new" element={<CreateGroupPage />} />
      <Route path="/groups/edit/:id/:name" element={<EditGroupPage />} />
      <Route path="/friends" element={<FriendsList />} />
      <Route path="/repayments" element={<RepaymentRequests />} />
      <Route path="/audit" element={<AuditReports />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/currency" element={<CurrencySettingsPage />} />
      <Route path="/transaction/:id/:name" element={<TransactionPage />} />
      <Route path="/payment-summary/:id/:name" element={<PaymentSummaryPage />} />
      <Route path="/group/:id/:name" element={<GroupTransactionPage />} />
      <Route path="/request/:id/:name" element={<RequestMoneyPage />} />
      <Route path="/group-message/:id/:name" element={<GroupSpliPage />} />
      <Route path="/expense-detail/:groupId/:groupName/:expenseId" element={<ExpenseSplitDetailPage />} />
      <Route path="/dashboard/addnewbuild" element={<AddBuildForm />} />
      <Route path="/dashboard/buildingdetails" element={<BuildingDetails />} />
    </Route>
  </Route>,
];

export default MainRouter;

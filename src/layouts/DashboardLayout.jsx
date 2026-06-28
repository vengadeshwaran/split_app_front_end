import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserCircle, ClipboardList, Settings, BadgeIndianRupee, ShieldCheck } from "lucide-react";

import useIdle from "../customHooks/useIdle";
import { useReusableMutation, useResuableQuery } from "../customHooks/useDataQuery";
import { setCurrency } from "../redux/slice/currencySlice";
import { setLogout } from "../redux/slice/userSlice";
import { getSymbolByName } from "../constants/currencies";
import Header from "../pages/header/Header";
import WorkspacceSidebar from "./WorkSPaceSideBar";

const BASE_ITEMS = [
  { path: "/dashboard", label: "Dashboard",      icon: LayoutDashboard, badge: 0 },
  { path: "/groups",    label: "Groups Split",   icon: Users,           badge: 0 },
  { path: "/friends",   label: "Friends & Lists", icon: UserCircle,     badge: 0 },
  { path: "/audit",     label: "Audit Reports",  icon: ClipboardList,   badge: 0 },
  { path: "/settings",  label: "User Settings",  icon: Settings,        badge: 0 },
];

const ADMIN_ITEMS = [
  { path: "/currency",        label: "Currency",         icon: BadgeIndianRupee, badge: 0 },
];

function DashboardLayout() {
  const { isIdle } = useIdle();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const { token, name, email, is_admin } = useSelector((state) => state.user);
  const currentUser = { name, email, isAdmin: is_admin };

  /* ── Fetch global currency; refetch when user switches back to this tab ── */
  const { data: settingsData } = useResuableQuery({
    endpoint:   "settings/currency",
    withToken:  true,
    dependency: token,
    options:    { refetchOnWindowFocus: true },
  });

  useEffect(() => {
    if (settingsData?.currency) {
      dispatch(setCurrency({
        name:   settingsData.currency,
        symbol: getSymbolByName(settingsData.currency),
      }));
    }
  }, [settingsData]);

  /* ── Sidebar items: currency only for admin ── */
  const sidebarItems = is_admin ? [...BASE_ITEMS, ...ADMIN_ITEMS] : BASE_ITEMS;

  const handleSeassionLogOut = React.useCallback(async () => {
    dispatch(setLogout());
    navigate("/");
  }, [dispatch, navigate]);

  useEffect(() => {
    // No token-based logout timer; token expiry is handled by the auth server.
    return undefined;
  }, [token, handleSeassionLogOut]);

  useEffect(() => {
    if (isIdle) { handleSeassionLogOut(); }
  }, [isIdle]);

  return (
    <section className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans transition-colors duration-350">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-1 flex flex-col md:flex-row overflow-hidden">
        <section>
          <WorkspacceSidebar
            sidebarItems={sidebarItems}
            currentUser={currentUser}
          />
        </section>
        <section className="flex-1 min-w-0 w-full overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </section>
  );
}

export default DashboardLayout;

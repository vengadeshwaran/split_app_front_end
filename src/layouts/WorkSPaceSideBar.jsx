import { NavLink, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const WorkspaceSidebar = ({
  sidebarItems = [],
  currentUser,
}) => {
  const location = useLocation();
  const mobileItems = sidebarItems.slice(0, 5);

  const hideNav = ["/request/", "/transaction/", "/group/", "/group-message/", "/expense-detail/", "/currency", "/groups/new", "/groups/edit/", "/payment-summary/"].some(p =>
    location.pathname.startsWith(p)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col gap-2">

        {/* Main Menu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5 mb-2">
            Workspace Menu
          </div>

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                      location.pathname === item.path
                        ? "bg-white text-indigo-600"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Admin Menu */}
        {currentUser?.isAdmin && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 py-2.5 px-3.5 rounded-2xl text-xs font-bold transition-all border border-dashed ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10"
                    : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 border-purple-200"
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
              <span>Admin Console</span>
            </NavLink>
          </div>
        )}

        {/* Info Card */}
        <div className="p-4 bg-indigo-50/40 border border-indigo-100/30 rounded-3xl text-xs leading-normal space-y-1.5 mt-2">
          <span className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-600 block">
            Splitwise-like Simple Tracking
          </span>
          <p className="text-slate-500">
            Manage shared bills for trips, roommate rent splits, and dining
            with friends. Actual settlement is done manually outside the app.
          </p>
        </div>

      </aside>

      {/* Mobile Bottom Nav */}
      {!hideNav && <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-transparent">
        <div className="h-16 md:hidden w-[98%] mx-auto fixed bottom-0 left-0 right-0 z-50 bg-[#0000ff12] blur-[2px] border-2 border-[#0000ff12] rounded-3xl"></div>
        <div className="flex items-center justify-around w-[98%] mx-auto h-16 px-2  z-51 relative">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
              >
                <div
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[9px] font-bold leading-none text-center">
                    {item.label.split(" ")[0]}
                  </span>
                </div>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>}
    </>
  );
};

export default WorkspaceSidebar;
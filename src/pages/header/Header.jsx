import React from "react";
import { useNavigate, NavLink, useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft, Pencil } from "lucide-react";
import { setLogout } from "../../redux/slice/userSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const params   = useParams();

  const isTransactionPage  = location.pathname.startsWith("/transaction/");
  const isGroupPage        = location.pathname.startsWith("/group/");
  const isRequestPage         = location.pathname.startsWith("/request/");
  const isGroupMessagePage    = location.pathname.startsWith("/group-message/");
  const isExpenseDetailPage   = location.pathname.startsWith("/expense-detail/");
  const isGroupEditPage       = location.pathname.startsWith("/groups/edit/");
  const isCreateGroupPage     = location.pathname === "/groups/new";
  const isDetailPage = isTransactionPage || isGroupPage || isRequestPage || isGroupMessagePage || isExpenseDetailPage || isGroupEditPage || isCreateGroupPage;
  const friendName = isDetailPage && params.name
    ? decodeURIComponent(params.name)
    : null;

  function logout() {
    dispatch(setLogout());
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {isDetailPage ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isExpenseDetailPage)
                  return navigate(`/group/${params.groupId}/${params.groupName}`);
                if (isGroupEditPage)
                  return navigate(`/group/${params.id}/${params.name || ""}`);
                if (isGroupPage || isGroupMessagePage || isCreateGroupPage)
                  return navigate("/groups");
                navigate(-1);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {isGroupMessagePage ? (
              <div>
                <p className="text-slate-800 font-black text-base leading-tight">Add Bill Split</p>
                <p className="text-slate-400 text-[10px] font-medium">Distribute expenses using standard split types</p>
              </div>
            ) : isExpenseDetailPage ? (
              <div>
                <p className="text-slate-800 font-black text-base leading-tight">Expense Split</p>
                <p className="text-slate-400 text-[10px] font-medium">Who paid & who owes</p>
              </div>
            ) : isGroupEditPage ? (
              <div>
                <p className="text-slate-800 font-black text-base leading-tight">Edit Group</p>
                <p className="text-slate-400 text-[10px] font-medium">Update details & manage members</p>
              </div>
            ) : isCreateGroupPage ? (
              <div>
                <p className="text-slate-800 font-black text-base leading-tight">Create New Group</p>
                <p className="text-slate-400 text-[10px] font-medium">Name, color & add members</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-800 font-black text-base leading-tight">{friendName}</p>
                <p className="text-slate-400 text-[10px] font-medium">ID: {params.id}</p>
              </div>
            )}
          </div>
        ) : (
          /* Default Logo */
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20 select-none">
              SE
            </div>
            <div>
              <div className="font-black text-slate-950 text-base tracking-tight leading-none">SplitEasy</div>
              <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                v1.2.0 Active
              </span>
            </div>
          </NavLink>
        )}

        <div className="flex items-center gap-2">
          {isGroupPage && params.id && (
            <button
              onClick={() => navigate(`/groups/edit/${params.id}/${params.name || ""}`)}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Local Sandbox Mode
          </div>
          <button
            onClick={logout}
            className="text-xs text-rose-600 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;

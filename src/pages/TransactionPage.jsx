import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, ArrowDownLeft, Receipt, CheckCircle2, Loader2, XCircle } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";
import { setPaymentComplete } from "../redux/slice/chatSlice";

const BADGE = {
  expense:          { label: "EXPENSE LOGGED",    cls: "bg-amber-100 text-amber-700"    },
  payment:          { label: "PAYMENT COMPLETED", cls: "bg-emerald-100 text-emerald-700" },
  request_sent:     { label: "REQUEST SENT",      cls: "bg-indigo-100 text-indigo-700"  },
  request_received: { label: "MONEY REQUESTED",   cls: "bg-rose-100 text-rose-700"      },
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const formatLedgerDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const buildTitle = (type, isFromMe, friendName) => {
  if (type === "expense") return isFromMe ? "You added an expense"   : `${friendName} added an expense`;
  if (type === "payment") return isFromMe ? "You sent a payment"     : `${friendName} sent a payment`;
  if (type === "request") return isFromMe ? "You requested money"    : `${friendName} requested money`;
  return "";
};

const TransactionPage = () => {
  const { id, name }  = useParams();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const currentUserId = useSelector((s) => s.user.user_id);
  const completedFriends = useSelector((s) => s.chat.completedFriends);
  const friendName    = decodeURIComponent(name);

  const [expandedId,  setExpandedId]  = useState(null);
  const [actionError, setActionError] = useState("");
  const bottomRef = useRef(null);

  const { data: transactions = [], isLoading, refetch } = useResuableQuery({
    endpoint:   `transactions/with/${id}`,
    withToken:  true,
    dependency: id,
  });

  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoading, transactions]);

  const { mutate: complete, isPending: completing } = useReusableMutation({
    onSuccess: () => {
      dispatch(setPaymentComplete(String(id)));
      refetch();
      setExpandedId(null);
    },
    onError: () => {},
  });

  const { mutate: acceptMutation, isPending: isAccepting } = useReusableMutation({
    onSuccess: () => { refetch(); setActionError(""); },
    onError: (err) => {
      setActionError(err?.response?.data?.error || "Failed to accept. Please try again.");
    },
  });

  const { mutate: declineMutation, isPending: isDeclining } = useReusableMutation({
    onSuccess: () => { refetch(); setActionError(""); },
    onError: (err) => {
      setActionError(err?.response?.data?.error || "Failed to decline. Please try again.");
    },
  });

  const handleMarkComplete = (txId) => {
    complete({ endPoint: `transactions/${txId}/complete`, method: "patch", json: false });
  };

  const handleAccept = (txId) => {
    setActionError("");
    acceptMutation({ endPoint: `transactions/${txId}/accept`, method: "patch", json: false });
  };

  const handleDecline = (txId) => {
    setActionError("");
    declineMutation({ endPoint: `transactions/${txId}/decline`, method: "patch", json: false });
  };

  const isActioning = isAccepting || isDeclining;

  const ledgerStart     = transactions.length > 0 ? transactions[0].created_at : null;
  const isPaymentDone   = completedFriends[String(id)] ||
    transactions.some((tx) => tx.status === "completed");

  return (
    <div className="flex flex-col h-full min-h-screen bg-transparent md:px-6">

      {/* Ledger Started */}
      <div className="flex justify-center py-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {ledgerStart
              ? `Ledger Started ${formatLedgerDate(ledgerStart)}`
              : "No transactions yet"}
          </span>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto pb-36 space-y-3 px-1">

        {isLoading && (
          <div className="flex flex-col gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] bg-slate-100 rounded-2xl h-24 animate-pulse w-64" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Receipt className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600">No transactions yet</p>
            <p className="text-xs text-slate-400">
              Request money from {friendName} using the button below.
            </p>
          </div>
        )}

        {!isLoading && transactions.map((tx) => {
          const isFromMe    = Number(tx.from_user_id) === Number(currentUserId);
          const side        = isFromMe ? "right" : "left";
          const isCompleted = tx.status === "completed";
          const isDeclined  = tx.status === "declined";
          const isResolved  = isCompleted || isDeclined;

          const badgeKey    = tx.type === "request"
            ? (isFromMe ? "request_sent" : "request_received")
            : tx.type;
          const badge       = BADGE[badgeKey] || BADGE.expense;
          const title       = buildTitle(tx.type, isFromMe, friendName);
          const isExpanded  = expandedId === tx.id;

          /* receiver sees Accept/Decline only on pending requests */
          const showActions = tx.type === "request" && !isFromMe && !isResolved;
          const isExpandable = (!isFromMe && showActions) || (isFromMe && !isResolved);

          return (
            <div
              key={tx.id}
              className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                onClick={() => isExpandable && setExpandedId(isExpanded ? null : tx.id)}
                className={`max-w-[80%] rounded-2xl px-4 py-3.5 space-y-2 shadow-sm transition-all
                  ${side === "right"
                    ? isDeclined
                      ? "bg-slate-100 border border-slate-300 opacity-70"
                      : isCompleted
                        ? "bg-emerald-100 border border-emerald-300"
                        : "bg-emerald-50 border border-emerald-200 cursor-pointer active:scale-[0.98]"
                    : isDeclined
                      ? "bg-rose-50 border border-rose-200 opacity-75"
                      : showActions
                        ? "bg-white border border-slate-200 cursor-pointer active:scale-[0.98]"
                        : "bg-white border border-slate-200"
                  }
                `}
              >
                {/* Badge + Time */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {isCompleted && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide bg-emerald-600 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> COMPLETED
                    </span>
                  )}
                  {isDeclined && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide bg-rose-600 text-white flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5" /> DECLINED
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatTime(tx.created_at)}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-bold text-slate-800 leading-snug">{title}</p>

                {/* Description */}
                {tx.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{tx.description}</p>
                )}

                {/* Amount */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Verified Total</span>
                  <span className="text-base font-black text-slate-800 tracking-wide">
                    {tx.currency} {Number(tx.amount).toFixed(2)}
                  </span>
                </div>

                {/* Accept / Decline — receiver, pending request, expanded */}
                {showActions && isExpanded && (
                  <div className="pt-2 border-t border-rose-100 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDecline(tx.id); }}
                      disabled={isActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-extrabold py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {isDeclining
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <XCircle className="w-3.5 h-3.5" />}
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAccept(tx.id); }}
                      disabled={isActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {isAccepting
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Accept
                    </button>
                  </div>
                )}

                {/* Mark as Complete — sender, pending, expanded */}
                {isFromMe && !isResolved && isExpanded && (
                  <div className="pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMarkComplete(tx.id); }}
                      disabled={completing}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60"
                    >
                      {completing
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…</>
                        : <><CheckCircle2 className="w-3.5 h-3.5" /> Mark as Complete</>
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error toast */}
      {actionError && (
        <div
          onClick={() => setActionError("")}
          className="fixed bottom-20 left-4 right-4 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <XCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100">
        <PrimaryButton onClick={() => navigate(`/request/${id}/${encodeURIComponent(name)}`)}>
          <ArrowDownLeft className="w-4 h-4" />
          Request Money
        </PrimaryButton>
      </div>
    </div>
  );
};

export default TransactionPage;

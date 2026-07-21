import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { isMobile } from "react-device-detect";

const PayModal = ({ roomId, to, maxAmount, onClose, onSuccess }) => {
  // Steps: 'amount' -> 'payment' -> 'submitting'
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState(""); // Default to empty to force user input
  const [error, setError] = useState("");
  const [isMobileState, setIsMobileState] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileState(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Construct UPI Link (Safe check for missing UPI ID)
  const upiLink = to?.upiId
    ? `upi://pay?pa=${to.upiId}&pn=${encodeURIComponent(to.name)}&am=${amount}&cu=INR&tn=SplitwiseSettlement`
    : null;

  /* ---------------- HANDLERS ---------------- */

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (Number(amount) > maxAmount) {
      setError(`You can pay at most ₹${maxAmount}`);
      return;
    }

    // If user has no UPI ID, we skip the QR step and go strictly to manual confirmation logic
    // OR you could show an error saying "User hasn't set up UPI"
    if (!to?.upiId) {
      // Option A: Just go to "payment" step but show a warning text instead of QR
      setStep("payment");
    } else {
      setStep("payment");
    }
  };

  const handleMarkAsPaid = async () => {
    setStep("submitting");
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/settlements`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          // Important: 'to' is the object, so we send to._id to the backend
          body: JSON.stringify({
            roomId,
            to: to._id,
            amount: Number(amount),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      onSuccess(); // Refresh data
      onClose(); // Close modal
    } catch (err) {
      setError(err.message || "Unable to connect to server");
      setStep("payment"); // Go back to payment screen on error so they can try again
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        {step !== "submitting" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
          >
            ✕
          </button>
        )}

        {/* --- STEP 1: ENTER AMOUNT --- */}
        {step === "amount" && (
          <div className="p-6">
            <h2 className="text-xl font-black text-gray-900 mb-1">Settle Up</h2>
            <p className="text-gray-500 text-sm mb-6">
              Paying{" "}
              <span className="font-bold text-gray-800">
                {to?.name || "User"}
              </span>
            </p>

            <form onSubmit={handleNext}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-2 text-2xl font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={maxAmount.toString()}
                    className="w-full pl-6 text-3xl font-black text-gray-900 border-b-2 border-gray-200 focus:border-[#1cc29f] outline-none py-2 placeholder-gray-200"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {error}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Total pending: ₹{maxAmount}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1cc29f] text-white font-bold hover:bg-[#15a88a] transition shadow-md hover:shadow-lg transform active:scale-95"
              >
                Next
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 2: MAKE PAYMENT (QR / LINK) --- */}
        {step === "payment" && (
          <div className="p-6 text-center flex flex-col h-full overflow-y-auto">
            <h2 className="text-xl font-black text-gray-900 mb-4 shrink-0">
              Scan or Tap to Pay
            </h2>

            {/* ERROR DISPLAY (If API call fails later) */}
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* QR / LINK CONTAINER */}
            <div className="flex-grow flex flex-col items-center justify-center mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {!to?.upiId ? (
                // CASE: NO UPI ID FOUND
                <div className="text-center">
                  <p className="text-amber-600 font-bold mb-2">
                    ⚠ UPI ID Missing
                  </p>
                  <p className="text-xs text-gray-500">
                    {to.name} hasn't added a UPI ID yet. You'll need to pay them
                    manually (cash/transfer) and then confirm below.
                  </p>
                </div>
              ) : isMobile && isMobileState ? (
                // CASE: MOBILE (BUTTON)
                <div className="w-full">
                  <a
                    href={upiLink}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
                  >
                    <span>Pay ₹{amount} via UPI</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <p className="text-xs text-gray-500 mt-3">
                    Opens GPay, PhonePe, Paytm
                  </p>
                </div>
              ) : (
                // CASE: DESKTOP (QR)
                <>
                  <div className="bg-white p-2 rounded-lg shadow-sm border">
                    <QRCode value={upiLink} size={150} />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Scan to pay{" "}
                    <span className="font-bold text-gray-800">{to.name}</span>
                  </p>
                </>
              )}
            </div>

            {/* CONFIRMATION BUTTONS */}
            <div className="border-t border-gray-100 pt-4 shrink-0">
              <p className="text-sm text-gray-600 mb-3">
                After you have completed the payment:
              </p>
              <button
                onClick={handleMarkAsPaid}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>✅ I have paid ₹{amount}</span>
              </button>
              <button
                onClick={() => setStep("amount")}
                className="mt-3 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                Back to amount
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: LOADING --- */}
        {step === "submitting" && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin w-12 h-12 border-4 border-[#1cc29f] border-t-transparent rounded-full mb-6"></div>
            <h3 className="text-lg font-bold text-gray-900">Processing...</h3>
            <p className="text-gray-500 text-sm mt-2">
              Notifying {to?.name} about the payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayModal;

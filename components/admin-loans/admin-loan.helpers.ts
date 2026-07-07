import { AdminLoan, AdminLoanStatus } from "@/redux/features/loan/adminLoanApi";

/* ─────────────────────────────────────────────────────────────
   Admin loan helpers
   UI readable data এখানে format করা হয়েছে।
────────────────────────────────────────────────────────────── */
export const LOAN_ICONS: Record<string, string> = {
  trading: "T",
  house: "H",
  business: "B",
  study: "S",
  land: "L",
  emergency: "E",
  other: "O",
};

export const LOAN_LABELS: Record<string, string> = {
  trading: "Trading Loan",
  house: "Home Loan",
  business: "Business Loan",
  study: "Student Loan",
  land: "Land Loan",
  emergency: "Emergency Loan",
  other: "Other Loan",
};

export const ADMIN_LOAN_TABS: AdminLoanStatus[] = [
  "pending",
  "active",
  "completed",
  "rejected",
];

export const getLoanApplicantName = (loan: AdminLoan) => {
  if (loan.applicantName) return loan.applicantName;

  if (typeof loan.userId === "object") {
    return loan.userId.fullName || loan.userId.name || "Unknown User";
  }

  return "Unknown User";
};

export const getLoanApplicantEmail = (loan: AdminLoan) => {
  if (loan.applicantEmail) return loan.applicantEmail;

  if (typeof loan.userId === "object") {
    return loan.userId.email || "No email found";
  }

  return "No email found";
};

export const getLoanApplicantPhone = (loan: AdminLoan) => {
  if (typeof loan.userId === "object") return loan.userId.phone || "—";
  return "—";
};

export const getLoanKycStatus = (loan: AdminLoan) => {
  if (typeof loan.userId === "object") {
    if (loan.userId.kycStatus) return loan.userId.kycStatus;
    if (loan.userId.kyc_verified === true) return "verified";
  }

  return "—";
};

export const getApiErrorMessage = (
  error: any,
  fallback = "Something went wrong",
) => {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    fallback
  );
};

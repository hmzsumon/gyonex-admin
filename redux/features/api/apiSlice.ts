/* ────────── base RTK Query api slice imports ────────── */
import { baseQueryWithReauth } from "@/redux/baseQueryWithReauth";
import { createApi } from "@reduxjs/toolkit/query/react";

/* ────────── base RTK Query api slice with lottery tags ────────── */
export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Users",
    "Admin",
    "Pxc",
    "Wallet",
    "Transactions",
    "User",
    "Withdraw",
    "Withdraws",
    "MyWithdraws",
    "Mining",
    "Deposits",
    "Notification",
    "Notifications",
    "Package",
    "Transaction",
    "Trade",
    "Trades",
    "Transfer",
    "Accounts",
    "Positions",
    "Deposit",
    "Loans",
    "Wallets",
    "LotteryWinners",
    "LotteryTickets",
    "Lottery",
  ],
  endpoints: (builder) => ({}),
});

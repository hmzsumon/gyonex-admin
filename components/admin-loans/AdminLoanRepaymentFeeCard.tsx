"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGetAdminLoanRepaymentSettingsQuery, useUpdateAdminLoanRepaymentSettingsMutation } from "@/redux/features/loan/adminLoanApi";
export default function AdminLoanRepaymentFeeCard() {
 const {data,isLoading,isError} = useGetAdminLoanRepaymentSettingsQuery();
 const [update,{isLoading:saving}] = useUpdateAdminLoanRepaymentSettingsMutation();
 const [fee,setFee] = useState("8");
 useEffect(()=>{if(data) setFee(String(data.settings.repaymentFeePercent));},[data]);
 return <form className="rounded-2xl border border-white/10 p-4" onSubmit={async e=>{
 e.preventDefault();try {await update({repaymentFeePercent:Number(fee)}).unwrap();toast.success("Fee saved");}catch {toast.error("Could not save fee");}
 }}>
 <label>Loan repayment fee (%) <input required type="number" min="0" max="100" step="0.01" value={fee} onChange={e=>setFee(e.target.value)} className="rounded-lg bg-black p-2 text-white" /></label>
 <p className="mt-2 text-sm">Repaying $100 deducts ${(100+Number(fee||0)).toFixed(2)} from the main balance.</p>
 {isError && <p role="alert">Could not load current fee.</p>}
 <button disabled={isLoading||isError||saving} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 disabled:opacity-50">{saving?"Saving...":"Save fee"}</button>
 </form>;
}

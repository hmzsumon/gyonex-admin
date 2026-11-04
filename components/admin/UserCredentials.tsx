"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateUserPasswordMutation } from "@/redux/features/admin/adminUsersApi";
import UserPropertyItem from "./UserPropertyItem";

export default function UserCredentials({ id, email, password }: { id: string; email: string; password?: string }) {
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);
  const [updatePassword, { isLoading }] = useUpdateUserPasswordMutation();
  const buttonClass = "rounded border border-teal-400/30 px-2 py-1 text-xs text-teal-300 disabled:opacity-40";
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  }
  return <>
    <UserPropertyItem label="Email" value={<span className="break-all">{email}</span>} addon={
      <button type="button" className={buttonClass} disabled={!email} onClick={() => copy(email, "Email")}>Copy email</button>
    } />
    <UserPropertyItem label="Password" value={password ? (show ? <span className="break-all">{password}</span> : "••••••••") : "Not available"} addon={
      <div className="flex gap-2">
        <button type="button" className={buttonClass} disabled={!password} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        <button type="button" className={buttonClass} disabled={!password} onClick={() => password && copy(password, "Password")}>Copy password</button>
      </div>
    } />
    <form className="space-y-2 py-3" onSubmit={async (event) => {
      event.preventDefault();
      try {
        await updatePassword({ id, password: draft }).unwrap();
        setDraft("");
        setShow(false);
        toast.success("Password saved");
      } catch (error: unknown) {
        toast.error((error as { data?: { message?: string } })?.data?.message || "Could not save password");
      }
    }}>
      <label htmlFor="user-new-password" className="block text-xs text-white/60">Set new password</label>
      <input id="user-new-password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={6} maxLength={72} value={draft} disabled={isLoading} onChange={event => setDraft(event.target.value)} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="At least 6 characters" />
      <button type="submit" className={buttonClass} disabled={isLoading || draft.length < 6}>{isLoading ? "Saving…" : "Save password"}</button>
    </form>
  </>;
}

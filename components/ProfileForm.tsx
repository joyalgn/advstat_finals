"use client";

import { useActionState } from "react";
import { updateProfileAction } from "../app/auth/actions";

export default function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <section className="panel profile-panel reveal">
      <form action={formAction}>
        <div className="field"><label htmlFor="profile-name">Name</label><input id="profile-name" name="name" type="text" defaultValue={name} minLength={2} maxLength={80} required /></div>
        <div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" value={email} readOnly /><p className="hint">Email changes require verification and are not enabled here.</p></div>
        {state.error && <p className="error" role="alert">{state.error}</p>}
        {state.success && <p className="profile-success" role="status">{state.success}</p>}
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving..." : "Save profile"}</button>
      </form>
    </section>
  );
}
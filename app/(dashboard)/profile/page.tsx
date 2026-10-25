import ProfileForm from "../../../components/ProfileForm";
import { requireAuthenticatedUser } from "../../auth/session";

export const metadata = { title: "Profile Settings | ADVSTAT" };

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser();
  return (
    <main className="container">
      <section className="page-head reveal">
        <h1>Profile Settings</h1>
        <p>Manage the profile details associated with your ADVSTAT account.</p>
      </section>
      <ProfileForm name={user.name} email={user.email} />
    </main>
  );
}
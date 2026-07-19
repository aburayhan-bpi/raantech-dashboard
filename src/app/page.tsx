import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware should handle this, but as a fallback, we redirect to login
  redirect("/login");
}

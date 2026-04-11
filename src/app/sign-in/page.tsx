import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined;

  redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
}

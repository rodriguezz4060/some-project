import type { Metadata } from "next";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@root/actions/users";
import { UsersTableClient } from "./users-table-client";

export const metadata: Metadata = {
  title: "Користувачі | 23 ОМБр",
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage(props: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await getUsers({ query, page });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Користувачі</h1>
          <p className="text-sm text-muted-foreground">
            Управління обліковими записами
          </p>
        </div>
      </div>

      <UsersTableClient
        users={result.users}
        currentUserId={Number(session.user.id)}
        total={result.total}
        totalPages={result.totalPages}
        currentPage={page}
        currentQuery={query}
      />
    </div>
  );
}

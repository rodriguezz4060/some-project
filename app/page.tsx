import { Container } from "@/components/shared/container";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <Container className="secondary">
      <div className="flex flex-col border-b border-[#2B2B2B]">
        <div className="flex items-center gap-1 p-3">
          <span className="h-3 w-3 rounded-xs bg-blue-500" />
          <h2 className="text-xl">Головна</h2>
        </div>
      </div>

      <Link
        href="/military"
        className="flex items-center gap-2 p-3 text-lg font-semibold text-white hover:text-blue-500"
      >
        <span>Військові</span>
      </Link>
    </Container>
  );
}

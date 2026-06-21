import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mb-2 text-5xl font-bold text-muted-foreground">
            404
          </div>
          <CardTitle>Сторінку не знайдено</CardTitle>
          <CardDescription>
            Сторінка, яку ви шукаєте, не існує або була переміщена.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Перевірте правильність URL або поверніться на головну.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/military">На головну</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

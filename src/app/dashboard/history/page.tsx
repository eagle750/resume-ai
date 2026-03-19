import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tailoredResumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const items = await db
    .select()
    .from(tailoredResumes)
    .where(eq(tailoredResumes.userId, session.user.id))
    .orderBy(desc(tailoredResumes.createdAt))
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tailoring history</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No tailored resumes yet.{" "}
          <Link href="/dashboard" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {item.jobTitle || "Untitled"} at {item.companyName || "Unknown"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"} · ATS: {item.atsScore ?? "—"}
                </p>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard?open=${item.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}

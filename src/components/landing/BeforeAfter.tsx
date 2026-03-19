import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const beforeExample = `• Worked on backend services
• Used Python and SQL
• Helped improve performance`;

const afterExample = `• Reduced API response time by 40% using Redis caching and query optimization (Python, SQL), improving user retention by 12%
• Built and maintained backend services processing 10K+ requests/day; collaborated with frontend and product teams
• Identified and fixed performance bottlenecks; decreased error rate by 25%`;

export function BeforeAfter() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Before vs after tailoring</h2>
        <Tabs defaultValue="after" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After (tailored)</TabsTrigger>
          </TabsList>
          <TabsContent value="before" className="mt-4">
            <pre className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap font-sans">
              {beforeExample}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">Generic bullets that don’t match the JD.</p>
          </TabsContent>
          <TabsContent value="after" className="mt-4">
            <pre className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap font-sans">
              {afterExample}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">Action verb + metric + result, with JD keywords.</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

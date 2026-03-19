const testimonials = [
  {
    quote: "Got my first call from a FAANG company after using ResumeAI. The ATS score tip was a game-changer.",
    author: "Priya M.",
    role: "Software Engineer",
  },
  {
    quote: "I tailor my resume for every application now. Takes 30 seconds and the PDF looks professional.",
    author: "Rahul K.",
    role: "Product Manager",
  },
  {
    quote: "Finally understood why my resume wasn’t getting shortlisted. The missing keywords list helped a lot.",
    author: "Anita S.",
    role: "Data Analyst",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What job seekers say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="p-6 rounded-lg border bg-card"
            >
              <p className="text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 font-medium">{t.author}</footer>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

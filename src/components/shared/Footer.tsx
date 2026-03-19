import Link from "next/link";

const toolLinks = [
  { href: "/tools/ats-score-checker", label: "ATS Score Checker" },
  { href: "/tools/resume-keyword-scanner", label: "Keyword Scanner" },
  { href: "/tools/resume-summary-generator", label: "Summary Generator" },
];

const exampleLinks = [
  { href: "/resume-examples/software-engineer", label: "Software Engineer" },
  { href: "/resume-examples/data-analyst", label: "Data Analyst" },
  { href: "/resume-examples/product-manager", label: "Product Manager" },
];

const companyLinks = [
  { href: "/tools/google-resume", label: "Google" },
  { href: "/tools/tcs-resume", label: "TCS" },
  { href: "/tools/infosys-resume", label: "Infosys" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Free Tools</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {toolLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Resume Examples</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {exampleLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Company Guides</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container py-4 border-t text-center text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
        {" · "}
        <Link href="/terms" className="hover:text-foreground">Terms</Link>
        {" · "}
        © {new Date().getFullYear()} ResumeAI
      </div>
    </footer>
  );
}

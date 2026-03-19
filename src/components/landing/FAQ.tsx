import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { FAQ_ITEMS } from "@/data/faq";

export function FAQ() {
  return (
    <section className="py-16 md:py-24">
      <FAQJsonLd faqs={FAQ_ITEMS} />
      <div className="container max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <Accordion className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

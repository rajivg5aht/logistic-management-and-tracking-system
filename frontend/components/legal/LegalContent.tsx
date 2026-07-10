type LegalSection = {
  title: string;
  body: string[];
};

type LegalContentProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalContent({
  title,
  description,
  lastUpdated,
  sections,
}: LegalContentProps) {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(ellipse_at_top,rgba(200,162,74,0.10)_0%,transparent_62%)]" />

      <div className="relative mx-auto w-full max-w-[960px] px-5 sm:px-6 lg:px-8">
        <div className="section-tag">
          <span className="section-tag-dot" />
          Legal
        </div>
        <h1 className="heading-lg mt-1">{title}</h1>
        <p className="mt-4 body-text">{description}</p>
        <p className="mt-4 text-sm font-semibold text-[var(--text-muted)]">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="card p-6 sm:p-8">
              <h2 className="heading-sm">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="body-text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
import Link from 'next/link';

const LINKS = [
  { href: '/academy', label: 'Academy' },
  { href: '/feed', label: 'Feed' },
  { href: '/download', label: 'Extension' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
];

export function FooterV4() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 py-10 border-t v2:border-line border-border">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="v2:text-ink text-foreground underline-offset-4 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-4 text-xs v2:text-ink-muted text-muted-foreground">
        Prompt Temple by Pharaonic Tech. Library prompts keep their source and licence on every page.
      </p>
    </footer>
  );
}

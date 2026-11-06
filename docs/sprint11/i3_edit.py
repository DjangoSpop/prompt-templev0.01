# Sprint 11 I3 — v2-gated restyle of feed/reader components. Idempotent: an edit whose
# old string is absent but whose new string is present is skipped; otherwise it must match once.
import sys
E = {}
def add(path, pairs): E[path] = pairs

add('src/components/ui/button.tsx', [
("import { cn } from \"@/lib/utils\"\n",
 "import { cn } from \"@/lib/utils\"\nimport { ExplainLine } from \"@/components/brand/ExplainLine\"\n"),
("        default: \"bg-primary text-primary-foreground hover:bg-primary/90\",",
 "        default: \"bg-primary text-primary-foreground hover:bg-primary/90 v2:rounded-pill v2:bg-faience-fill v2:text-faience-on v2:font-semibold v2:active:scale-[0.98] v2:transition-transform v2:duration-tap\","),
("          \"border border-input bg-background hover:bg-accent hover:text-accent-foreground\",",
 "          \"border border-input bg-background hover:bg-accent hover:text-accent-foreground v2:rounded-pill v2:border-line v2:bg-transparent v2:text-ink v2:font-semibold v2:hover:bg-surface-sunken\","),
("        ghost: \"hover:bg-accent hover:text-accent-foreground\",",
 "        ghost: \"hover:bg-accent hover:text-accent-foreground v2:rounded-pill v2:hover:bg-surface-sunken\","),
("  asChild?: boolean\n}",
 "  asChild?: boolean\n  /** Brand v2: one sentence rendered under the button saying what it does and why (ExplainLine). */\n  reason?: string\n}"),
("  ({ className, variant, size, asChild = false, ...props }, ref) => {\n    const Comp = asChild ? Slot : \"button\"\n    return (\n      <Comp\n        className={cn(buttonVariants({ variant, size, className }))}\n        ref={ref}\n        {...props}\n      />\n    )\n  }",
 "  ({ className, variant, size, asChild = false, reason, ...props }, ref) => {\n    const Comp = asChild ? Slot : \"button\"\n    const button = (\n      <Comp\n        className={cn(buttonVariants({ variant, size, className }))}\n        ref={ref}\n        {...props}\n      />\n    )\n    if (!reason) return button\n    return (\n      <span className=\"inline-flex flex-col gap-1\">\n        {button}\n        <ExplainLine>{reason}</ExplainLine>\n      </span>\n    )\n  }"),
])

add('src/components/ui/card.tsx', [
("      \"rounded-lg border bg-card text-card-foreground shadow-sm\",",
 "      \"rounded-lg border bg-card text-card-foreground shadow-sm v2:rounded-cartouche v2:border-line v2:bg-surface v2:shadow-none\","),
("      \"text-2xl font-semibold leading-none tracking-tight\",",
 "      \"text-2xl font-semibold leading-none tracking-tight v2:font-display\","),
])

add('src/components/feed/PromptText.tsx', [
("          data-kind=\"variable\"\n          dir=\"ltr\"",
 "          data-kind=\"variable\"\n          className=\"v2:rounded-sm v2:bg-lapis-soft v2:px-1 v2:text-pt-variable\"\n          dir=\"ltr\""),
("            <pre key={key} data-kind=\"code\">",
 "            <pre key={key} data-kind=\"code\" className=\"v2:rounded-sm v2:bg-surface-sunken v2:p-3 v2:font-mono v2:text-pt-code\">"),
("                <li key={i} data-kind={l.kind} style=",
 "                <li key={i} data-kind={l.kind} className={l.kind === 'rule' ? 'v2:border-l-2 v2:border-pt-rule v2:pl-3' : undefined} style="),
("            <h4 key={key} id={`${idPrefix}-${line.id ?? `h-${key}`}`} data-kind=\"heading\"",
 "            <h4 key={key} id={`${idPrefix}-${line.id ?? `h-${key}`}`} className=\"v2:inline-block v2:border-b v2:border-gilt-line v2:pb-0.5 v2:font-semibold v2:text-pt-heading\" data-kind=\"heading\""),
("          <p key={key} data-kind={line.kind}>",
 "          <p key={key} data-kind={line.kind} className={cn(line.kind === 'role' && 'v2:font-semibold v2:text-pt-role', line.kind === 'format' && 'v2:text-pt-format', line.kind === 'example' && 'v2:italic v2:text-pt-example')}>"),
("      className={cn('pt-text text-[0.9375rem] leading-relaxed', text.length > LONG_TEXT_CHARS && 'pt-long', rtl && 'font-arabic', className)}",
 "      className={cn('pt-text text-[0.9375rem] leading-relaxed v2:font-mono v2:text-[15px] v2:leading-6', text.length > LONG_TEXT_CHARS && 'pt-long', rtl && 'font-arabic', className)}"),
])

add('src/components/feed/PromptCard.tsx', [
("          className=\"max-w-[11rem] truncate rounded-md border border-border/60 bg-foreground/5 px-1.5 py-0.5 text-[11px] text-foreground/75\"",
 "          className=\"max-w-[11rem] truncate rounded-md border border-border/60 bg-foreground/5 px-1.5 py-0.5 text-[11px] text-foreground/75 v2:rounded-sm v2:border-line v2:bg-transparent v2:text-ink-muted\""),
("        <span className=\"inline-flex items-center gap-1 rounded-md bg-[#C9A227]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#8a6d12] dark:text-[#e2c25a]\">\n          <Variable",
 "        <span className=\"inline-flex items-center gap-1 rounded-md bg-[#C9A227]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#8a6d12] dark:text-[#e2c25a] v2:rounded-sm v2:bg-lapis-soft v2:text-lapis v2-dark:text-lapis\">\n          <Variable"),
("      className={cn('min-w-0 overflow-clip rounded-xl border-border/50 p-4 transition-colors', open ? 'border-[#C9A227]/50' : 'hover:border-[#C9A227]/40')}",
 "      className={cn('min-w-0 overflow-clip rounded-xl border-border/50 p-4 transition-colors v2:rounded-cartouche v2:border-line v2:bg-surface v2:shadow-none v2:p-4 v2:md:p-6', open ? 'border-[#C9A227]/50 v2:border-line v2:shadow-lift' : 'hover:border-[#C9A227]/40 v2:hover:border-line')}"),
("          <span className=\"rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/75\">{item.category}</span>\n          <span className=\"rounded-full border border-border px-2 py-0.5 font-medium\">{formLabel(item.form)}</span>",
 "          <span className=\"rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/75 v2:rounded-pill v2:border v2:border-line v2:bg-transparent v2:text-xs v2:font-semibold v2:uppercase v2:tracking-[0.06em] v2:text-ink-muted\">{item.category}</span>\n          <span className=\"rounded-full border border-border px-2 py-0.5 font-medium v2:rounded-pill v2:border-line v2:text-xs v2:font-semibold v2:uppercase v2:tracking-[0.06em] v2:text-ink-muted\">{formLabel(item.form)}</span>"),
("            <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a]\">\n              <Flame",
 "            <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a] v2:rounded-pill v2:bg-faience-soft v2:text-faience v2-dark:text-faience\">\n              <Flame"),
("            <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black\">\n              <BadgeCheck",
 "            <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black v2:rounded-pill v2:border v2:border-line v2:bg-surface v2:text-ink\">\n              <BadgeCheck className=\"hidden v2:inline v2:text-gilt\" aria-hidden /><BadgeCheck"),
("        <h3 id={titleId} dir={rtl ? 'rtl' : undefined} className={cn('font-display font-bold leading-snug tracking-tight', variant === 'full' ? 'text-lg' : 'text-base', rtl && 'font-arabic')}>",
 "        <h3 id={titleId} dir={rtl ? 'rtl' : undefined} className={cn('font-display font-bold leading-snug tracking-tight v2:font-display v2:font-semibold v2:text-[20px] v2:leading-[26px] v2:tracking-[-0.01em] v2:text-ink', variant === 'full' ? 'text-lg' : 'text-base', rtl && 'font-arabic')}>"),
("              className=\"text-start hover:text-primary focus-visible:underline\"\n              aria-expanded={open}",
 "              className=\"text-start hover:text-primary focus-visible:underline v2:hover:text-faience\"\n              aria-expanded={open}"),
("                className={cn('inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium sm:h-8', open ? 'text-muted-foreground hover:text-foreground' : 'bg-foreground/5 text-foreground hover:bg-foreground/5')}",
 "                className={cn('inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium sm:h-8 v2:rounded-pill v2:bg-transparent v2:text-faience v2:hover:bg-surface-sunken', open ? 'text-muted-foreground hover:text-foreground' : 'bg-foreground/5 text-foreground hover:bg-foreground/5')}"),
("                {open ? 'Close' : 'Read'}",
 "                {open ? 'Close' : 'Read the prompt'}"),
("    <Card className=\"rounded-xl border-border/50 p-4\" aria-hidden>",
 "    <Card className=\"rounded-xl border-border/50 p-4 v2:rounded-cartouche v2:border-line\" aria-hidden>"),
])

add('src/components/feed/StickyActionBar.tsx', [
("        'pt-reader-bar sticky z-20 -mx-4 flex h-11 items-center gap-1 border-b border-border/60 bg-card/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:mx-0 sm:rounded-md sm:border sm:px-2',",
 "        'pt-reader-bar sticky z-20 -mx-4 flex h-11 items-center gap-1 border-b border-border/60 bg-card/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:mx-0 sm:rounded-md sm:border sm:px-2 v2:border-line v2:bg-surface v2:backdrop-blur-none v2:supports-[backdrop-filter]:bg-surface v2:sm:rounded-pill',"),
("      <span className=\"hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium md:inline\">{formLabel(item.form)}</span>",
 "      <span className=\"hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium md:inline v2:rounded-pill v2:border-line v2:text-xs v2:font-semibold v2:uppercase v2:tracking-[0.06em] v2:text-ink-muted\">{formLabel(item.form)}</span>"),
("      <Button size=\"sm\" className=\"h-9 shrink-0 gap-1.5 bg-[#C9A227] px-3 text-black hover:bg-[#b8921f] sm:h-8\" onClick={() => onCopy()} disabled={copying} data-testid=\"reader-copy\">",
 "      <Button size=\"sm\" className=\"h-9 shrink-0 gap-1.5 bg-[#C9A227] px-3 text-black hover:bg-[#b8921f] sm:h-8 v2:rounded-pill v2:bg-faience-fill v2:text-faience-on v2:hover:bg-faience-fill v2:hover:opacity-90\" onClick={() => onCopy()} disabled={copying} data-testid=\"reader-copy\">"),
("        <span>{copied ? 'Copied ✓' : copyLabel}</span>",
 "        <span>{copied ? 'Copied' : copyLabel}</span>"),
("        className={cn(ghost, item.viewer.saved && 'text-[#C9A227]')}",
 "        className={cn(ghost, item.viewer.saved && 'text-[#C9A227] v2:text-faience')}"),
("      <Button variant=\"ghost\" className={cn(ghost, 'hidden sm:inline-flex', item.viewer.forked && 'text-[#C9A227]')}",
 "      <Button variant=\"ghost\" className={cn(ghost, 'hidden sm:inline-flex', item.viewer.forked && 'text-[#C9A227] v2:text-faience')}"),
("      <Button variant=\"ghost\" className={cn(ghost, 'font-serif')} title=",
 "      <Button variant=\"ghost\" className={cn(ghost, 'font-serif v2:font-sans')} title="),
])

add('src/components/feed/ReaderRegion.tsx', [
("import { StickyActionBar, type OpenInTarget } from './StickyActionBar';",
 "import { StickyActionBar, type OpenInTarget } from './StickyActionBar';\nimport { ExplainLine } from '@/components/brand/ExplainLine';"),
("lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:shadow-2xl')}",
 "lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:shadow-2xl v2:lg:rounded-cartouche v2:lg:border-line v2:lg:bg-surface v2:lg:shadow-lift')}"),
("        inPanel={focusMode}\n      />\n\n      <div className=\"mt-3 space-y-3\">",
 "        inPanel={focusMode}\n      />\n      <CopyExplainOnce />\n\n      <div className=\"mt-3 space-y-3\">"),
])

add('src/components/feed/FeedView.tsx', [
("  trending: 'Nothing is trending yet — be the first to like a prompt.',",
 "  trending: 'Nothing is trending yet. Be the first to like a prompt.',"),
("  top: 'No top prompts yet — be the first to like a prompt.',",
 "  top: 'No top prompts yet. Be the first to like a prompt.',"),
("  for_you: 'Save or like three prompts and this tab will fill up.',",
 "  for_you: 'Save or like three prompts and this tab fills up.',"),
("const FILTERED_EMPTY = 'No prompts match; clear a filter.';",
 "const FILTERED_EMPTY = 'No prompts match. Clear a filter.';"),
("      <div className=\"mx-4 mt-4 rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-3 text-sm\" role=\"status\">\n        <strong className=\"font-semibold\">Feed coming soon.</strong> Browse the library instead — every prompt is below.",
 "      <div className=\"mx-4 mt-4 rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-3 text-sm v2:rounded-md v2:border-l-2 v2:border-lapis v2:border-y-0 v2:border-r-0 v2:bg-lapis-soft v2:text-ink\" role=\"status\">\n        <strong className=\"font-semibold v2:text-lapis\">Feed coming soon.</strong> Browse the library instead. Every prompt is below."),
("          <Link href=\"/feed/c/sota\" className=\"font-medium text-[#8a6d12] hover:underline dark:text-[#e2c25a]\">",
 "          <Link href=\"/feed/c/sota\" className=\"font-medium text-[#8a6d12] hover:underline dark:text-[#e2c25a] v2:text-faience v2-dark:text-faience\">"),
])

add('src/components/feed/FeedColumn.tsx', [
("      <div className=\"rounded-xl border border-border/60 p-8 text-center\" role=\"alert\">",
 "      <div className=\"rounded-xl border border-border/60 p-8 text-center v2:rounded-cartouche v2:border-line\" role=\"alert\">"),
("    return <p className=\"rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground\">{props.emptyText}</p>;",
 "    return <p className=\"rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground v2:rounded-cartouche v2:border-line v2:text-ink-muted\">{props.emptyText}</p>;"),
])

add('src/components/feed/FeedFilters.tsx', [
("                      active ? 'border-[#C9A227] bg-[#C9A227]/15 font-medium text-foreground' : 'border-border hover:border-[#C9A227]/50'",
 "                      active ? 'border-[#C9A227] bg-[#C9A227]/15 font-medium text-foreground v2:border-transparent v2:bg-faience-soft v2:text-faience' : 'border-border hover:border-[#C9A227]/50 v2:border-line v2:hover:border-line v2:hover:bg-surface-sunken'"),
("        Filters{active > 0 && <span className=\"rounded-full bg-[#C9A227] px-1.5 text-[11px] font-semibold text-black\">{active}</span>}",
 "        Filters{active > 0 && <span className=\"rounded-full bg-[#C9A227] px-1.5 text-[11px] font-semibold text-black v2:bg-faience-fill v2:text-faience-on\">{active}</span>}"),
("          className=\"inline-flex items-center gap-1 rounded-full bg-[#C9A227]/15 px-2.5 py-1 text-xs font-medium\"",
 "          className=\"inline-flex items-center gap-1 rounded-full bg-[#C9A227]/15 px-2.5 py-1 text-xs font-medium v2:bg-faience-soft v2:text-faience\""),
])

add('src/components/feed/PromptActions.tsx', [
("        className={cn(btn, 'gap-1.5', item.viewer.saved && 'text-[#C9A227]')}",
 "        className={cn(btn, 'gap-1.5', item.viewer.saved && 'text-[#C9A227] v2:text-faience')}"),
("        className={cn(btn, 'gap-1.5', item.viewer.forked && 'text-[#C9A227]')}",
 "        className={cn(btn, 'gap-1.5', item.viewer.forked && 'text-[#C9A227] v2:text-faience')}"),
])

add('src/components/feed/SignUpCta.tsx', [
("          <span className=\"mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227]/10 text-[#C9A227]\" aria-hidden>",
 "          <span className=\"mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227]/10 text-[#C9A227] v2:bg-faience-soft v2:text-faience\" aria-hidden>"),
("          <Button asChild className=\"w-full\">",
 "          <Button asChild className=\"w-full v2:rounded-pill v2:bg-faience-fill v2:text-faience-on\">"),
])

add('src/components/feed/PromptPageView.tsx', [
("          <details key={i} id={`section-${i}`} open className=\"group scroll-mt-20 rounded-lg border border-border/60\">",
 "          <details key={i} id={`section-${i}`} open className=\"group scroll-mt-20 rounded-lg border border-border/60 v2:rounded-md v2:border-line\">"),
("          <span className=\"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums\">",
 "          <span className=\"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums v2:bg-faience-soft v2:text-faience\">"),
("              <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a]\">",
 "              <span className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a] v2:rounded-pill v2:bg-faience-soft v2:text-faience v2-dark:text-faience\">"),
("              <Link href=\"/feed/c/sota\" className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black\">",
 "              <Link href=\"/feed/c/sota\" className=\"inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black v2:rounded-pill v2:border v2:border-line v2:bg-surface v2:text-ink\">"),
("            <div className=\"rounded-xl border border-border/60 p-3\">",
 "            <div className=\"rounded-xl border border-border/60 p-3 v2:rounded-cartouche v2:border-line\">"),
("            <div className=\"rounded-xl border border-border/60 p-3 text-sm\">",
 "            <div className=\"rounded-xl border border-border/60 p-3 text-sm v2:rounded-cartouche v2:border-line\">"),
])

add('src/components/feed/ReaderViews.tsx', [
("        <details key={i} open className=\"group rounded-lg border border-border/60\">",
 "        <details key={i} open className=\"group rounded-lg border border-border/60 v2:rounded-md v2:border-line\">"),
("          <span className=\"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums\">",
 "          <span className=\"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums v2:bg-faience-soft v2:text-faience\">"),
("    <div role=\"tablist\" aria-label=\"View\" className=\"inline-flex rounded-lg bg-foreground/5 p-1\">",
 "    <div role=\"tablist\" aria-label=\"View\" className=\"inline-flex rounded-lg bg-foreground/5 p-1 v2:rounded-pill v2:border v2:border-line v2:bg-transparent\">"),
])

add('src/components/feed/ReaderFooter.tsx', [
("                  <button type=\"button\" className=\"rounded-md border border-border/60 px-2 py-1 text-left hover:border-[#C9A227]/60 hover:text-foreground\" onClick={() => onOpenRelated(r.slug)}>",
 "                  <button type=\"button\" className=\"rounded-md border border-border/60 px-2 py-1 text-left hover:border-[#C9A227]/60 hover:text-foreground v2:rounded-sm v2:border-line v2:hover:border-line v2:hover:bg-surface-sunken v2:hover:text-faience\" onClick={() => onOpenRelated(r.slug)}>"),
])

def run(path):
    s = open(path, encoding='utf-8').read()
    applied = skipped = 0
    for old, new in E[path]:
        n = s.count(old)
        if n == 1:
            s = s.replace(old, new, 1); applied += 1
        elif n == 0 and new in s:
            skipped += 1
        else:
            print(f"MISS {path}: count={n} for: {old[:70]!r}"); return False
    open(path, 'w', encoding='utf-8').write(s)
    print(f"OK {path}: applied={applied} already={skipped}")
    return True

if __name__ == '__main__':
    targets = sys.argv[1:] or list(E)
    ok = all(run(t) for t in targets)
    sys.exit(0 if ok else 1)

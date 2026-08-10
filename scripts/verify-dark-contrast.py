#!/usr/bin/env python3
"""Phase 2 dark-mode contrast verification.

Tokens are PARSED OUT OF src/index.css, never retyped, so a drift between the
plan and the shipped stylesheet shows up as a parse mismatch rather than as a
number that agrees with itself. Alpha composites are done per channel in sRGB
gamma space, which is what a browser does.
"""
import re
import sys
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = (ROOT / "src" / "index.css").read_text()


# ---------------------------------------------------------------- colour maths
def srgb(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hexof(rgb):
    return "#%02X%02X%02X" % tuple(int(round(c)) for c in rgb)


def lum(rgb):
    def ch(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def over(fg, bg, alpha):
    """Composite fg over bg at `alpha`, per channel, in sRGB gamma space,
    quantised back to 8 bits because that is what a compositor hands the
    display. Skipping the quantisation moves the third decimal place."""
    return tuple(round(alpha * f + (1 - alpha) * b) for f, b in zip(fg, bg))


def r2(a, b):
    return round(ratio(a, b), 3)


# ----------------------------------------------------- oklch -> sRGB (Tailwind)
def oklch_to_srgb(L, C, h_deg):
    h = math.radians(h_deg)
    a, b = C * math.cos(h), C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def enc(c):
        c = 1.055 * (c ** (1 / 2.4)) - 0.055 if c > 0.0031308 else 12.92 * c
        return max(0.0, min(255.0, c * 255.0))
    return tuple(enc(c) for c in (lr, lg, lb))


# ------------------------------------------------- parse tokens from index.css
def block(pattern):
    m = re.search(pattern + r"\s*\{(.*?)\n\}", CSS, re.S)
    if not m:
        sys.exit("FATAL: could not find block %r in src/index.css" % pattern)
    # Strip comments first. A prose line such as "reach: form control internals"
    # otherwise matches the declaration pattern and its greedy value swallows
    # every character up to the NEXT real semicolon, eating the declaration that
    # follows it. That is how an earlier run of this script reported
    # `color-scheme` missing from a file that declares it on line 100.
    body = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
    out = {}
    for name, val in re.findall(r"^\s*((?:--)?[a-z-]+)\s*:\s*([^;\n]+);", body, re.M):
        out[name] = val.strip()
    return out


light_root = block(r"(?<!\])\n:root")
dark_media = block(r":root:not\(\[data-theme=\"light\"\]\)")
dark_attr = block(r":root\[data-theme=\"dark\"\]")

if dark_media != {k: v for k, v in dark_attr.items() if k != "color-scheme"}:
    da = {k: v for k, v in dark_attr.items() if not k.startswith("color-scheme")}
    if dark_media != da:
        print("!! MEDIA AND ATTRIBUTE DARK BLOCKS DISAGREE")
        print("   media:", dark_media)
        print("   attr :", da)

LIGHT = {k[2:]: v for k, v in light_root.items() if v.startswith("#")}
INVARIANT = dict(LIGHT)
DARK = dict(LIGHT)
DARK.update({k[2:]: v for k, v in dark_media.items() if v.startswith("#")})

print("=" * 78)
print("TOKENS AS PARSED FROM src/index.css")
print("=" * 78)
print("%-14s %-10s %-10s %s" % ("token", "light", "dark", "swaps?"))
for k in ["paper", "band", "ink", "muted", "rule", "edge", "accent",
          "accent-press", "on-accent", "accent-plate", "on-plate"]:
    swaps = "yes" if LIGHT[k].upper() != DARK[k].upper() else "NO (invariant)"
    print("%-14s %-10s %-10s %s" % ("--" + k, LIGHT[k], DARK[k], swaps))
print("%-14s %-10s %-10s %s" % ("--scrim", light_root["--scrim"],
                                light_root["--scrim"], "NO (invariant)"))
print("color-scheme on :root ->", light_root.get("color-scheme", "*** MISSING ***"))
print()

L = {k: srgb(v) for k, v in LIGHT.items()}
D = {k: srgb(v) for k, v in DARK.items()}
SCRIM_RGB, SCRIM_A = srgb("#131311"), 0.6

rows = []


def row(mode, label, fg, bg, req, note=""):
    rr = ratio(fg, bg)
    ok = rr >= req
    rows.append((mode, label, hexof(fg), hexof(bg), rr, req, ok, note))
    return rr


# ------------------------------------------------------------- the 65 plan rows
for mode, T in (("light", L), ("dark", D)):
    row(mode, "--ink body/display on --paper", T["ink"], T["paper"], 4.5)
    row(mode, "--ink on --band", T["ink"], T["band"], 4.5)
    row(mode, "--muted secondary on --paper", T["muted"], T["paper"], 4.5)
    row(mode, "--muted on --band", T["muted"], T["band"], 4.5)
    row(mode, "--muted placeholder on --band field fill", T["muted"], T["band"], 4.5)
    row(mode, "--muted helper text on --paper", T["muted"], T["paper"], 4.5)
    row(mode, "--accent marked type on --paper", T["accent"], T["paper"], 4.5)
    row(mode, "--accent marked type on --band", T["accent"], T["band"], 4.5)
    row(mode, "--on-accent label on --accent fill", T["on-accent"], T["accent"], 4.5)
    row(mode, "--accent-press fill, --on-accent label", T["on-accent"], T["accent-press"], 4.5)
    row(mode, "--accent fill boundary vs --paper", T["accent"], T["paper"], 3.0)
    row(mode, "--accent fill boundary vs --band", T["accent"], T["band"], 3.0)
    row(mode, "3px --accent mark rule vs --paper", T["accent"], T["paper"], 3.0)
    row(mode, "3px --accent mark rule vs --band", T["accent"], T["band"], 3.0)
    row(mode, "--rule 1px hairline vs --paper", T["rule"], T["paper"], 3.0)
    row(mode, "--rule vs --band", T["rule"], T["band"], 3.0)
    row(mode, "--edge input/secondary border vs --paper", T["edge"], T["paper"], 3.0)
    row(mode, "--edge vs --band field fill", T["edge"], T["band"], 3.0)
    row(mode, "--ink label on secondary button (--paper fill)", T["ink"], T["paper"], 4.5)
    row(mode, "focus ring OUTER --ink vs --paper page ground", T["ink"], T["paper"], 3.0)
    row(mode, "focus ring inner/outer boundary (--paper vs --ink)", T["paper"], T["ink"], 3.0)
    row(mode, "error text --ink on --paper (no accent)", T["ink"], T["paper"], 4.5)
    row(mode, "disabled label --muted on --band fill", T["muted"], T["band"], 4.5)
    row(mode, "--on-plate type on --accent-plate", T["on-plate"], T["accent-plate"], 4.5)
    row(mode, "--on-plate pill fill boundary vs --accent-plate", T["on-plate"], T["accent-plate"], 3.0)
    row(mode, "--accent-plate label on the --on-plate pill", T["accent-plate"], T["on-plate"], 4.5)
    row(mode, "JoinModal 1px --rule border vs modal --paper ground", T["rule"], T["paper"], 3.0)
    row(mode, "error text --ink on modal --paper ground", T["ink"], T["paper"], 4.5)

    # focus ring better layer on the invariant plate
    inner, outer = T["paper"], T["ink"]
    better = max(ratio(inner, T["accent-plate"]), ratio(outer, T["accent-plate"]))
    which = "inner --paper" if ratio(inner, T["accent-plate"]) >= ratio(outer, T["accent-plate"]) else "outer --ink"
    rows.append((mode, "focus ring BETTER layer (%s) vs --accent-plate" % which,
                 hexof(inner if which.startswith("inner") else outer),
                 hexof(T["accent-plate"]), better, 3.0, better >= 3.0, ""))

    # scrim composites
    for gname in ("paper", "band"):
        comp = over(SCRIM_RGB, T[gname], SCRIM_A)
        row(mode, "JoinModal --paper surface vs --scrim over --%s" % gname,
            T["paper"], comp, 3.0, "composite %s" % hexof(comp))
        row(mode, "JoinModal --rule border vs --scrim over --%s" % gname,
            T["rule"], comp, 3.0, "composite %s" % hexof(comp))

# --------------------------------------------------- the published FAILING rows
print("=" * 78)
print("THE SIX PUBLISHED FAILING ROWS (plan 4.2), RECOMPUTED")
print("=" * 78)
fails = [
    ("light", "--accent vs surrounding --ink body text (G183)", L["accent"], L["ink"], 3.0),
    ("dark", "--accent vs surrounding --ink body text (G183)", D["accent"], D["ink"], 3.0),
    ("light", "--band plate vs --paper ground, tone only", L["band"], L["paper"], 3.0),
    ("dark", "--band plate vs --paper ground, tone only", D["band"], D["paper"], 3.0),
    ("dark", "JoinModal --paper surface vs --scrim over dark page ground",
     D["paper"], over(SCRIM_RGB, D["paper"], SCRIM_A), 3.0),
    ("dark", "--on-accent #131311 on the --accent-plate (why --on-plate exists)",
     D["on-accent"], D["accent-plate"], 3.0),
]
for mode, label, fg, bg, req in fails:
    print("  %-5s %-62s %7.3f  (floor %.1f)" % (mode, label, ratio(fg, bg), req))

print()
print("  hairline at 75%% antialiased pixel coverage over its own ground:")
for mode, T in (("light", L), ("dark", D)):
    full = ratio(T["rule"], T["paper"])
    part = ratio(over(T["rule"], T["paper"], 0.75), T["paper"])
    print("     %-5s full-opacity %.3f   at 75%% coverage %.3f   -> %s"
          % (mode, full, part, "PASS" if part >= 3.0 else "FAILS the 3.0 floor"))
    print("            headroom at full opacity %+.1f%%, at 75%% coverage %+.1f%%"
          % ((full / 3.0 - 1) * 100, (part / 3.0 - 1) * 100))
print()

# ------------------------------------------------- the four named defect classes
print("=" * 78)
print("THE FOUR NAMED DEFECT CLASSES")
print("=" * 78)

print("1. FOCUS RING REVERSAL")
for mode, T in (("light", L), ("dark", D)):
    print("   %-5s as shipped   inner --paper %s / outer --ink %s : inner-vs-outer %.3f, outer-vs-ground %.3f"
          % (mode, hexof(T["paper"]), hexof(T["ink"]),
             ratio(T["paper"], T["ink"]), ratio(T["ink"], T["paper"])))
    print("   %-5s IF REVERSED  outer would be --paper -> outer-vs-page-ground %.3f"
          % (mode, ratio(T["paper"], T["paper"])))
print()

print("2. BARE ring-offset-2 (--tw-ring-offset-color defaults to #fff)")
WHITE = srgb("#ffffff")
for mode, T in (("light", L), ("dark", D)):
    print("   %-5s bare inner #FFFFFF vs outer --ink %s : %.3f  (intended %.3f)"
          % (mode, hexof(T["ink"]), ratio(WHITE, T["ink"]), ratio(T["paper"], T["ink"])))
print()

print("3. RING ON A --band GROUND (not in the plan's table; the inner layer's ground)")
for mode, T in (("light", L), ("dark", D)):
    print("   %-5s inner --paper vs --band ground %.3f (invisible) ; outer --ink vs --band %.3f (carries it)"
          % (mode, ratio(T["paper"], T["band"]), ratio(T["ink"], T["band"])))
print()

print("4. GREY SWEEP: worst ground for the two-layer ring, all 256 greys")
for mode, T in (("light", L), ("dark", D)):
    worst, worst_g = 999, None
    for v in range(256):
        g = (v, v, v)
        better = max(ratio(T["paper"], g), ratio(T["ink"], g))
        if better < worst:
            worst, worst_g = better, g
    print("   %-5s better layer never below %.3f (worst ground %s)" % (mode, worst, hexof(worst_g)))
print()

# ------------------------------------------------ hardcoded Tailwind slab sites
print("=" * 78)
print("HARDCODED TAILWIND PALETTE SLABS THAT DO NOT SWAP (oklch -> sRGB)")
print("=" * 78)
TW = {}
for name, l, c, h in [
    ("red-50", 0.971, 0.013, 17.38), ("red-100", 0.936, 0.032, 17.717),
    ("red-200", 0.885, 0.062, 18.334), ("red-700", 0.505, 0.213, 27.518),
    ("green-100", 0.962, 0.044, 156.743), ("green-700", 0.527, 0.154, 150.069),
]:
    TW[name] = oklch_to_srgb(l, c, h)
    print("   --color-%-10s oklch(%.3f %.3f %.3f) = %s" % (name, l, c, h, hexof(TW[name])))
print()

slabs = [
    ("Contact.tsx:346 form error", "bg-red-50", "text-red-700", "border-red-200"),
    ("Admin.tsx:440 load error", "bg-red-50", "text-red-700", "border-red-200"),
    ("CodeOfConduct.tsx:81 icon chip", "bg-red-50", "text-red-700", None),
    ("Contact.tsx:204 success chip", "bg-green-100", "text-green-700", None),
]
for where, bgname, fgname, bdname in slabs:
    bg, fg = TW[bgname.split("-", 1)[1]], TW[fgname.split("-", 1)[1]]
    print("   %s" % where)
    print("      text-on-slab %-12s on %-12s = %6.3f   (WCAG 4.5 -> %s)"
          % (fgname, bgname, ratio(fg, bg), "pass" if ratio(fg, bg) >= 4.5 else "FAIL"))
    for mode, T in (("light", L), ("dark", D)):
        ground = T["band"] if "CodeOfConduct" in where else T["paper"]
        gname = "--band" if "CodeOfConduct" in where else "--paper"
        print("      %-5s slab %-12s vs its %s page ground %s = %6.3f"
              % (mode, bgname, gname, hexof(ground), ratio(bg, ground)))
        print("      %-5s slab text %-9s vs the page's --ink %s = %6.3f  (G183 floor 3.0 -> %s)"
              % (mode, fgname, hexof(T["ink"]), ratio(fg, T["ink"]),
                 "pass" if ratio(fg, T["ink"]) >= 3.0 else "FAIL"))
    if bdname:
        bd = TW[bdname.split("-", 1)[1]]
        for mode, T in (("light", L), ("dark", D)):
            print("      %-5s border %-11s vs slab fill = %6.3f ; vs page --paper = %6.3f"
                  % (mode, bdname, ratio(bd, bg), ratio(bd, T["paper"])))
    print()

# ---------------------------------------------------- alpha composite call sites
print("=" * 78)
print("ALPHA COMPOSITES ON TOKENS (plan 4.1: --scrim is meant to be the only one)")
print("=" * 78)
alphas = [
    ("Contact 148/163/175, Events 102, Partners 87", "bg-ink/10 chip fill", "ink", 0.10, "paper", "ink"),
    ("HowItWorks 69", "text-ink/10 ghost numeral", "ink", 0.10, "paper", None),
    ("Hero 55 / HeroVisual 40", "bg-ink/10 blurred wash", "ink", 0.10, "paper", None),
    ("Hero 59 / HowItWorks 39", "bg-accent/10 blurred wash", "accent", 0.10, "paper", None),
    ("Events 223 / About 165", "bg-accent opacity-10 wash", "accent", 0.10, "band", "muted"),
    ("About 164", "bg-ink opacity-5 wash", "ink", 0.05, "band", "muted"),
    ("FinalCTA 50", "radial --ink opacity-5", "ink", 0.05, "band", "muted"),
    ("FinalCTA 51", "radial --accent opacity-10", "accent", 0.10, "band", "muted"),
    ("Membership 21 / Partners 48", "radial --muted opacity-10", "muted", 0.10, "band", "muted"),
]
for where, what, fgtok, a, gtok, textтok in alphas:
    print("   %s -- %s" % (where, what))
    for mode, T in (("light", L), ("dark", D)):
        comp = over(T[fgtok], T[gtok], a)
        line = "      %-5s composite %s over --%s %s = %s" % (
            mode, "--" + fgtok, gtok, hexof(T[gtok]), hexof(comp))
        if textтok:
            line += "   | --%s text on it = %6.3f" % (textтok, ratio(T[textтok], comp))
        line += "   | fill vs its own ground = %.3f" % ratio(comp, T[gtok])
        print(line)
    print()

# ----------------------------------------------------------- the Hero dot grid
print("=" * 78)
print("Hero.tsx:24 HARDCODED DOT GRID  rgb(15 23 42 / 0.06)  (== slate-900)")
print("=" * 78)
DOT = srgb("#0F172A")
for mode, T in (("light", L), ("dark", D)):
    comp = over(DOT, T["paper"], 0.06)
    print("   %-5s dot composites to %s on --paper %s ; dot vs ground = %.3f"
          % (mode, hexof(comp), hexof(T["paper"]), ratio(comp, T["paper"])))
print()

# --------------------------------------------------------------- the full table
print("=" * 78)
print("FULL RECOMPUTED TABLE")
print("=" * 78)
print("%-6s %-58s %-9s %-9s %8s %6s %s" % ("mode", "pairing", "fg", "bg", "ratio", "floor", ""))
failed = []
for mode, label, fg, bg, rr, req, ok, note in rows:
    mark = "pass" if ok else "**FAIL**"
    if not ok:
        failed.append((mode, label, rr, req))
    print("%-6s %-58s %-9s %-9s %8.3f %6.1f %s %s" % (mode, label[:58], fg, bg, rr, req, mark, note))

print()
print("=" * 78)
n_light = sum(1 for r in rows if r[0] == "light")
n_dark = sum(1 for r in rows if r[0] == "dark")
print("%d rows recomputed (%d light, %d dark). %d below their floor."
      % (len(rows), n_light, n_dark, len(failed)))
for mode, label, rr, req in failed:
    print("   FAIL %-5s %-60s %.3f < %.1f" % (mode, label, rr, req))
print("=" * 78)

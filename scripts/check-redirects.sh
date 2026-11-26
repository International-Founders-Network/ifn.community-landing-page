#!/usr/bin/env bash
# IFN-111 (was IFN-107): check that host/slash variants reach the canonical
# apex URL in at most one hop and finish with HTTP 200.
#
# Canonical: https://ifn.community/ for home, https://ifn.community/{path}
# (no trailing slash) for everything else.
#
# Usage:
#   scripts/check-redirects.sh
#       Production: https and http, apex and www, slash and no-slash,
#       for home plus every sitemap path.
#
#   scripts/check-redirects.sh --base https://deploy-preview-N--incandescent-dusk-aa82c2.netlify.app
#       Deploy preview: apex-style paths on the preview host only. Paths
#       come from the preview's own sitemap (whose <loc>s name the
#       production origin), or the frozen list below if it cannot be read. Preview hosts do not
#       serve www.ifn.community, so www and http checks are skipped.
#
#   --https-only     Skip http:// variants (useful when port 80 is blocked).
#   --strict-http    Count http:// variants that take 2+ hops as failures.
#   --no-sitemap     Use the frozen path list only.
#
# Result classes:
#   PASS  final URL is canonical, HTTP 200, at most one hop.
#   FAIL  more than one hop, wrong final URL, or not 200.
#   WARN  an http:// variant that reaches the canonical URL with 200 in more
#         than one hop. Netlify upgrades http to https on the same host at
#         the edge before any redirect rule runs, so http://www.../about/ is
#         at least two hops on this platform whatever the rules say. Use
#         --strict-http to fail on these instead.
#   SKIP  not checked (see the reason column).
#
# Exit 0 if there are no FAILs (WARN and SKIP do not fail the run).
# Exit 1 if any check FAILs. Exit 2 on bad arguments.
#
# EXPECTED RESULT TODAY. The https://www.ifn.community/{path}/ checks fail
# with two hops until the Netlify domain change described at the top of
# public/_redirects is made. ifn.community is the primary domain, and
# Netlify's automatic www -> primary redirect runs before _redirects, keeps
# the trailing slash, and cannot be overridden by a rule; the apex then
# 301s /{path}/ to /{path} because the prerendered pages are flat files.
# Deploy previews cannot show the www fix either, because they never
# receive www traffic: --base only exercises apex trailing-slash behavior.
set -euo pipefail

PROD_ORIGIN="https://ifn.community"
PROD_WWW="https://www.ifn.community"
PROD_HTTP_ORIGIN="http://ifn.community"
PROD_HTTP_WWW="http://www.ifn.community"
# This box's egress proxy. HTTP to it returns 500/Pingora and is not a
# site measurement. The script falls back to DNS-over-HTTPS + --resolve.
BOX_PROXY_IP="198.18.0.1"
DOH_URL="https://cloudflare-dns.com/dns-query"
CURL_MAX_TIME=20
CURL_MAX_REDIRS=5
CURL_RETRIES=3

# Sitemap paths as of 2026-11-25 (35 non-home locs). Home is tested
# separately. The script unions this list with a live sitemap fetch when
# one is available, so a new post is still checked.
FROZEN_PATHS=(
  /about
  /events
  /membership
  /resources
  /gallery
  /partners
  /workshops
  /sponsors
  /contact
  /code-of-conduct
  /privacy-policy
  /terms-and-conditions
  /blog
  /blog/money-questions-to-sort-before-you-land-in-the-us
  /blog/us-go-to-market-when-your-product-was-built-elsewhere
  /blog/building-your-first-50-connections-in-austin
  /blog/opening-an-ein-and-why-the-letter-matters-for-banking
  /blog/how-international-founders-find-us-legal-counsel
  /blog/how-we-validate-a-us-market-before-landing
  /blog/fundraising-as-an-international-founder-what-changes-in-the-us-conversation
  /blog/austin-ecosystem-map-for-international-founders
  /blog/first-90-days-in-austin-as-an-international-founder
  /blog/us-business-banking-document-pack
  /blog/visa-paths-founders-talk-about-at-ifn
  /blog/forming-a-us-company-from-abroad
  /blog/welcome-to-the-ifn-blog
  /blog/working-the-austin-day-and-the-home-country-night
  /blog/moving-to-austin-with-family-while-you-build
  /blog/getting-paid-by-your-first-us-customers
  /blog/raising-prices-after-years-of-underpricing
  /blog/the-founder-spouse-who-carries-the-company-with-no-title
  /blog/when-ai-takes-the-clients-who-used-to-pay-your-rent
  /blog/founder-burnout-that-ends-a-business-you-still-love
  /blog/when-your-accent-or-foreign-degree-gets-you-treated-as-a-risk
  /blog/founder-loneliness-the-room-is-full-and-you-are-still-alone
)

BASE=""
HTTPS_ONLY=0
STRICT_HTTP=0
NO_SITEMAP=0

usage() {
  awk 'NR == 1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "$0"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE="${2:-}"
      if [[ -z "$BASE" ]]; then
        echo "error: --base requires a URL" >&2
        exit 2
      fi
      shift 2
      ;;
    --https-only)
      HTTPS_ONLY=1
      shift
      ;;
    --strict-http)
      STRICT_HTTP=1
      shift
      ;;
    --no-sitemap)
      NO_SITEMAP=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

origin_trim() {
  local o="$1"
  o="${o%/}"
  echo "$o"
}

is_prod=1
CANON_ORIGIN="$PROD_ORIGIN"
if [[ -n "$BASE" ]]; then
  is_prod=0
  CANON_ORIGIN="$(origin_trim "$BASE")"
fi

canonical_for() {
  # $1 = path, with or without a trailing slash ("/" for home)
  local path="$1"
  if [[ -z "$path" || "$path" == "/" ]]; then
    echo "${CANON_ORIGIN}/"
    return
  fi
  path="/${path#/}"
  path="${path%/}"
  echo "${CANON_ORIGIN}${path}"
}

# The no-slash apex homepage currently returns 200 at https://ifn.community
# (no redirect to the slashed canonical). That is a separate observation,
# not IFN-107. Accept either form only for that one request.
is_acceptable_final() {
  local requested="$1"
  local final="$2"
  local expected="$3"
  if [[ "$final" == "$expected" ]]; then
    return 0
  fi
  if [[ "$is_prod" -eq 1 && "$requested" == "https://ifn.community" && "$final" == "https://ifn.community" && "$expected" == "https://ifn.community/" ]]; then
    return 0
  fi
  return 1
}

resolve_ipv4() {
  # Print one IPv4 for $1, or empty on failure. Uses DoH so we do not get
  # the box proxy address.
  local host="$1"
  local json
  json="$(curl -sS --max-time 10 -H "accept: application/dns-json" \
    "${DOH_URL}?name=${host}&type=A" 2>/dev/null || true)"
  python3 -c '
import json, sys
raw = sys.argv[1]
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)
for ans in data.get("Answer") or []:
    if ans.get("type") == 1 and ans.get("data"):
        print(ans["data"])
        break
' "$json"
}

http_resolve_args=()
http_ready=0
http_skip_reason=""

prepare_http_resolve() {
  if [[ "$HTTPS_ONLY" -eq 1 ]]; then
    http_skip_reason="--https-only"
    return
  fi
  if [[ "$is_prod" -ne 1 ]]; then
    http_skip_reason="deploy preview (http/www not served)"
    return
  fi

  local local_ip apex_ip www_ip
  local_ip="$(getent ahostsv4 ifn.community 2>/dev/null | awk '{print $1; exit}' || true)"
  if [[ -n "$local_ip" && "$local_ip" != "$BOX_PROXY_IP" ]]; then
    apex_ip="$local_ip"
    www_ip="$(getent ahostsv4 www.ifn.community 2>/dev/null | awk '{print $1; exit}' || true)"
  else
    apex_ip="$(resolve_ipv4 ifn.community)"
    www_ip="$(resolve_ipv4 www.ifn.community)"
  fi

  if [[ -z "$apex_ip" || -z "$www_ip" ]]; then
    http_skip_reason="could not resolve real IPv4 for HTTP --resolve"
    return
  fi
  if [[ "$apex_ip" == "$BOX_PROXY_IP" || "$www_ip" == "$BOX_PROXY_IP" ]]; then
    http_skip_reason="DNS still points at the box HTTP proxy (${BOX_PROXY_IP})"
    return
  fi

  http_resolve_args=(
    --resolve "ifn.community:80:${apex_ip}"
    --resolve "www.ifn.community:80:${www_ip}"
  )
  http_ready=1
}

extract_sitemap_paths() {
  # stdin: sitemap xml; args: origins whose <loc>s count as site paths.
  # A deploy preview serves the production sitemap, whose <loc>s name
  # https://ifn.community, so the production origin is always passed too.
  python3 -c '
import re, sys
text = sys.stdin.read()
locs = re.findall(r"<loc>\s*([^<]+)\s*</loc>", text)
seen = set()
prefixes = []
for origin in sys.argv[1:]:
    origin = origin.rstrip("/")
    prefixes += [origin, origin.replace("https://", "http://")]
for loc in locs:
    loc = loc.strip()
    path = None
    for prefix in prefixes:
        if loc == prefix or loc == prefix + "/":
            path = None
            break
        if loc.startswith(prefix + "/"):
            path = "/" + loc[len(prefix):].lstrip("/")
            path = path.rstrip("/") or "/"
            break
    if path and path != "/" and path not in seen:
        seen.add(path)
        print(path)
' "$@"
}

load_paths() {
  local -a paths=("${FROZEN_PATHS[@]}")
  if [[ "$NO_SITEMAP" -eq 1 ]]; then
    printf '%s\n' "${paths[@]}"
    return
  fi

  local sitemap_url tmp extra
  if [[ "$is_prod" -eq 1 ]]; then
    sitemap_url="${PROD_ORIGIN}/sitemap.xml"
  else
    sitemap_url="${CANON_ORIGIN}/sitemap.xml"
  fi
  tmp="$(mktemp)"
  if curl -sS --max-time 15 -o "$tmp" "$sitemap_url" 2>/dev/null; then
    extra="$(extract_sitemap_paths "$PROD_ORIGIN" "$CANON_ORIGIN" < "$tmp" || true)"
    if [[ -n "$extra" ]]; then
      # A preview publishes whatever its own build published (blog posts
      # go live by editorial status, not by merge), so its sitemap replaces
      # the frozen list rather than adding to it. Production keeps the
      # union, so a post that drops out of the live sitemap still fails.
      [[ "$is_prod" -ne 1 ]] && paths=()
      while IFS= read -r line; do
        [[ -n "$line" ]] && paths+=("$line")
      done <<< "$extra"
    fi
  fi
  rm -f "$tmp"
  printf '%s\n' "${paths[@]}" | awk 'NF && !seen[$0]++'
}

_code=""
_final=""
_hops=""
_chain=""
_curl_ok=0

format_chain() {
  python3 -c '
import sys
start = sys.argv[1]
path = sys.argv[2]
blocks = open(path, "r", errors="replace").read().split("\n\n")
hops = []
current = start
for block in blocks:
    lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
    if not lines:
        continue
    status = ""
    location = ""
    for ln in lines:
        low = ln.lower()
        if low.startswith("http/"):
            parts = ln.split()
            if len(parts) >= 2:
                status = parts[1]
        elif low.startswith("location:"):
            location = ln.split(":", 1)[1].strip()
    if status.startswith("3") and location:
        hops.append(f"{current} -{status}-> {location}")
        current = location
print(" ; ".join(hops) if hops else "(no redirect)")
' "$1" "$2"
}

trace_url() {
  local url="$1"
  shift
  local attempt hdr out rc
  _curl_ok=0
  _code="000"
  _final=""
  _hops="0"
  _chain="curl failed"
  for attempt in $(seq 1 "$CURL_RETRIES"); do
    hdr="$(mktemp)"
    set +e
    out="$(curl -sS -o /dev/null -D "$hdr" -L --max-redirs "$CURL_MAX_REDIRS" \
      --max-time "$CURL_MAX_TIME" \
      -w '%{http_code}\t%{url_effective}\t%{num_redirects}' \
      "$@" "$url" 2>/dev/null)"
    rc=$?
    set -e
    if [[ $rc -eq 0 ]]; then
      _curl_ok=1
      _code="$(printf '%s' "$out" | awk -F'\t' '{print $1}')"
      _final="$(printf '%s' "$out" | awk -F'\t' '{print $2}')"
      _hops="$(printf '%s' "$out" | awk -F'\t' '{print $3}')"
      _chain="$(format_chain "$url" "$hdr")"
      rm -f "$hdr"
      return
    fi
    _chain="curl failed (exit ${rc})"
    rm -f "$hdr"
    sleep 1
  done
}

pass=0
fail=0
warn=0
skip=0
failures=()
# Per-class tallies, "scheme host shape" -> "pass fail warn skip", so the
# summary shows which variant is still chained rather than one total.
declare -A class_counts=()

url_class() {
  local url="$1" scheme host path shape
  scheme="${url%%://*}"
  host="apex"
  [[ "$url" == *"://www."* ]] && host="www"
  path="/${url#*://*/}"
  [[ "$url" != *://*/* ]] && path="/"
  if [[ "$path" == "/" ]]; then
    shape="home"
  elif [[ "$path" == */ ]]; then
    shape="slash"
  else
    shape="noslash"
  fi
  echo "${scheme} ${host} ${shape}"
}

tally() {
  local url="$1" idx="$2" key
  key="$(url_class "$url")"
  local -a c=(${class_counts[$key]:-0 0 0 0})
  c[$idx]=$((c[idx] + 1))
  class_counts[$key]="${c[*]}"
}

printf '%-8s %-62s %4s %4s %s\n' "RESULT" "URL" "HOPS" "CODE" "FINAL / NOTE"
printf '%s\n' "------------------------------------------------------------------------------------------------------------------------"

record_pass() {
  local url="$1"
  pass=$((pass + 1))
  tally "$url" 0
  printf '%-8s %-62s %4s %4s %s\n' "PASS" "$url" "$_hops" "$_code" "$_final"
}

record_fail() {
  local url="$1"
  local note="$2"
  fail=$((fail + 1))
  tally "$url" 1
  failures+=("$url  hops=${_hops} code=${_code} final=${_final}  ${note}")
  printf '%-8s %-62s %4s %4s %s\n' "FAIL" "$url" "$_hops" "$_code" "${note} final=${_final} chain=${_chain}"
}

record_warn() {
  local url="$1"
  local note="$2"
  warn=$((warn + 1))
  tally "$url" 2
  printf '%-8s %-62s %4s %4s %s\n' "WARN" "$url" "$_hops" "$_code" "${note} chain=${_chain}"
}

record_skip() {
  local url="$1"
  local reason="$2"
  skip=$((skip + 1))
  tally "$url" 3
  printf '%-8s %-62s %4s %4s %s\n' "SKIP" "$url" "-" "-" "$reason"
}

check_one() {
  local url="$1"
  local expected="$2"
  shift 2

  trace_url "$url" "$@"
  if [[ "$_curl_ok" -ne 1 ]]; then
    record_fail "$url" "$_chain"
    return
  fi
  if [[ "$_code" != "200" ]]; then
    record_fail "$url" "expected final 200"
    return
  fi
  if ! is_acceptable_final "$url" "$_final" "$expected"; then
    record_fail "$url" "expected final ${expected}"
    return
  fi
  if [[ "$_hops" -gt 1 ]]; then
    if [[ "$url" == http://* && "$STRICT_HTTP" -ne 1 ]]; then
      record_warn "$url" "${_hops} hops (http upgrade runs before rules)"
      return
    fi
    record_fail "$url" "more than one hop"
    return
  fi
  record_pass "$url"
}

check_http() {
  local url="$1"
  local expected="$2"
  if [[ "$http_ready" -ne 1 ]]; then
    record_skip "$url" "http skipped: ${http_skip_reason}"
    return
  fi
  check_one "$url" "$expected" "${http_resolve_args[@]}"
}

prepare_http_resolve

mapfile -t PATHS < <(load_paths)

echo "Mode: $([[ "$is_prod" -eq 1 ]] && echo "production" || echo "preview ${CANON_ORIGIN}")"
echo "Paths: ${#PATHS[@]} non-home + home"
if [[ "$is_prod" -eq 1 ]]; then
  if [[ "$http_ready" -eq 1 ]]; then
    echo "HTTP: enabled via ${http_resolve_args[*]}"
  else
    echo "HTTP: skipped (${http_skip_reason})"
  fi
else
  echo "HTTP/www: skipped (${http_skip_reason:-deploy preview})"
fi
echo

expected_home="$(canonical_for /)"
if [[ "$is_prod" -eq 1 ]]; then
  check_one "${PROD_ORIGIN}/" "$expected_home"
  check_one "${PROD_ORIGIN}" "$expected_home"
  check_one "${PROD_WWW}/" "$expected_home"
  check_one "${PROD_WWW}" "$expected_home"
  check_http "${PROD_HTTP_ORIGIN}/" "$expected_home"
  check_http "${PROD_HTTP_ORIGIN}" "$expected_home"
  check_http "${PROD_HTTP_WWW}/" "$expected_home"
  check_http "${PROD_HTTP_WWW}" "$expected_home"
else
  check_one "${CANON_ORIGIN}/" "$expected_home"
  check_one "${CANON_ORIGIN}" "$expected_home"
fi

for path in "${PATHS[@]}"; do
  expected="$(canonical_for "$path")"
  if [[ "$is_prod" -eq 1 ]]; then
    check_one "${PROD_ORIGIN}${path}" "$expected"
    check_one "${PROD_ORIGIN}${path}/" "$expected"
    check_one "${PROD_WWW}${path}" "$expected"
    check_one "${PROD_WWW}${path}/" "$expected"
    check_http "${PROD_HTTP_ORIGIN}${path}" "$expected"
    check_http "${PROD_HTTP_ORIGIN}${path}/" "$expected"
    check_http "${PROD_HTTP_WWW}${path}" "$expected"
    check_http "${PROD_HTTP_WWW}${path}/" "$expected"
  else
    check_one "${CANON_ORIGIN}${path}" "$expected"
    check_one "${CANON_ORIGIN}${path}/" "$expected"
  fi
done

echo
echo "By class (scheme host shape: pass fail warn skip):"
for key in $(printf '%s\n' "${!class_counts[@]}" | tr ' ' '_' | sort); do
  printf '  %-24s %s\n' "${key//_/ }" "${class_counts[${key//_/ }]}"
done
echo
echo "Summary: ${pass} passed, ${fail} failed, ${warn} warned, ${skip} skipped"
if [[ ${#failures[@]} -gt 0 ]]; then
  echo
  echo "Failures:"
  for f in "${failures[@]}"; do
    echo "  - $f"
  done
fi

if [[ "$fail" -gt 0 ]]; then
  exit 1
fi
exit 0

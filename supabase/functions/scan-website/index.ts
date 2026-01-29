import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PAGESPEED_API_KEY = Deno.env.get("PAGESPEED_API_KEY");

// WCAG criterion mapping for Lighthouse audits
const WCAG_MAPPING: Record<string, { criterion: string; name: string; level: "A" | "AA" | "AAA"; principle: string }> = {
    "color-contrast": { criterion: "1.4.3", name: "Contrast (Minimum)", level: "AA", principle: "Perceivable" },
    "image-alt": { criterion: "1.1.1", name: "Non-text Content", level: "A", principle: "Perceivable" },
    "link-name": { criterion: "2.4.4", name: "Link Purpose (In Context)", level: "A", principle: "Operable" },
    "button-name": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "input-image-alt": { criterion: "1.1.1", name: "Non-text Content", level: "A", principle: "Perceivable" },
    "label": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "html-has-lang": { criterion: "3.1.1", name: "Language of Page", level: "A", principle: "Understandable" },
    "html-lang-valid": { criterion: "3.1.1", name: "Language of Page", level: "A", principle: "Understandable" },
    "valid-lang": { criterion: "3.1.2", name: "Language of Parts", level: "AA", principle: "Understandable" },
    "meta-viewport": { criterion: "1.4.4", name: "Resize Text", level: "AA", principle: "Perceivable" },
    "document-title": { criterion: "2.4.2", name: "Page Titled", level: "A", principle: "Operable" },
    "heading-order": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "bypass": { criterion: "2.4.1", name: "Bypass Blocks", level: "A", principle: "Operable" },
    "frame-title": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-allowed-attr": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-hidden-body": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-hidden-focus": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-required-attr": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-required-children": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-required-parent": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-roles": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-valid-attr-value": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "aria-valid-attr": { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust" },
    "duplicate-id-aria": { criterion: "4.1.1", name: "Parsing", level: "A", principle: "Robust" },
    "form-field-multiple-labels": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "list": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "listitem": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "definition-list": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "dlitem": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "tabindex": { criterion: "2.4.3", name: "Focus Order", level: "A", principle: "Operable" },
    "accesskeys": { criterion: "2.4.1", name: "Bypass Blocks", level: "A", principle: "Operable" },
    "focus-traps": { criterion: "2.1.2", name: "No Keyboard Trap", level: "A", principle: "Operable" },
    "focusable-controls": { criterion: "2.1.1", name: "Keyboard", level: "A", principle: "Operable" },
    "interactive-element-affordance": { criterion: "2.4.7", name: "Focus Visible", level: "AA", principle: "Operable" },
    "logical-tab-order": { criterion: "2.4.3", name: "Focus Order", level: "A", principle: "Operable" },
    "managed-focus": { criterion: "2.4.3", name: "Focus Order", level: "A", principle: "Operable" },
    "offscreen-content-hidden": { criterion: "2.4.3", name: "Focus Order", level: "A", principle: "Operable" },
    "use-landmarks": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "visual-order-follows-dom": { criterion: "1.3.2", name: "Meaningful Sequence", level: "A", principle: "Perceivable" },
    "td-headers-attr": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "th-has-data-cells": { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable" },
    "video-caption": { criterion: "1.2.2", name: "Captions (Prerecorded)", level: "A", principle: "Perceivable" },
    "audio-caption": { criterion: "1.2.1", name: "Audio-only and Video-only", level: "A", principle: "Perceivable" },
    "object-alt": { criterion: "1.1.1", name: "Non-text Content", level: "A", principle: "Perceivable" },
    "target-size": { criterion: "2.5.5", name: "Target Size", level: "AAA", principle: "Operable" },
};

// Severity mapping based on Lighthouse score impact
function getSeverity(audit: LighthouseAudit): "critical" | "high" | "medium" | "low" {
    // Failed audits with high weight or many items are more severe
    if (audit.score === 0) {
        const itemCount = audit.details?.items?.length || 0;
        if (itemCount > 10) return "critical";
        if (itemCount > 5) return "high";
        return "medium";
    }
    if (audit.score !== null && audit.score < 0.5) return "high";
    if (audit.score !== null && audit.score < 0.9) return "medium";
    return "low";
}

// Types
interface Finding {
    id: string;
    check: string;
    severity: "critical" | "high" | "medium" | "low";
    message: string;
    details?: string;
    count?: number;
    wcagCriterion?: string;
    wcagName?: string;
    wcagLevel?: "A" | "AA" | "AAA";
    wcagPrinciple?: string;
    pageUrl?: string;
    remediation?: string;
    elements?: string[];
}

interface Summary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    accessibilityScore?: number;
}

interface PageResult {
    pageUrl: string;
    pageTitle?: string;
    accessibilityScore: number;
    findings: Finding[];
    summary: Summary;
}

interface ScanResponse {
    success: boolean;
    sessionId: string;
    summary: Summary;
    teaser: {
        topIssue: string;
        issueCount: number;
        accessibilityScore?: number;
    };
    pagesScanned?: number;
    pageResults?: PageResult[];
    error?: string;
    cached?: boolean;
}

interface LighthouseAudit {
    id: string;
    title: string;
    description: string;
    score: number | null;
    scoreDisplayMode: string;
    details?: {
        items?: Array<{
            node?: {
                selector?: string;
                snippet?: string;
                explanation?: string;
            };
            [key: string]: unknown;
        }>;
        [key: string]: unknown;
    };
}

interface PageSpeedResponse {
    lighthouseResult?: {
        categories?: {
            accessibility?: {
                score: number;
            };
        };
        audits?: Record<string, LighthouseAudit>;
        finalUrl?: string;
    };
    error?: {
        message: string;
    };
}

// CORS headers
const allowedOrigins = [
    "https://getcomply.tech",
    "https://certifyada.vercel.app",
    "http://localhost:8080",
    "http://localhost:8081",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
}

// Rate limiting check
async function checkRateLimit(
    supabase: ReturnType<typeof createClient>,
    clientIp: string
): Promise<{ allowed: boolean; remaining: number }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
        .from("scan_results")
        .select("*", { count: "exact", head: true })
        .eq("client_ip", clientIp)
        .gte("created_at", oneHourAgo);

    if (error) {
        console.error("Rate limit check error:", error);
        return { allowed: true, remaining: 5 };
    }

    const scansInLastHour = count || 0;
    const limit = 5;

    return {
        allowed: scansInLastHour < limit,
        remaining: Math.max(0, limit - scansInLastHour),
    };
}

// Check for cached scan of same URL
async function getCachedScan(
    supabase: ReturnType<typeof createClient>,
    websiteUrl: string
): Promise<{ sessionId: string; summary: Summary; findings: Finding[]; pageResults?: PageResult[] } | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("scan_results")
        .select("session_id, summary, findings, page_results")
        .eq("website_url", websiteUrl)
        .gte("created_at", oneHourAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        sessionId: data.session_id,
        summary: data.summary as Summary,
        findings: data.findings as Finding[],
        pageResults: data.page_results as PageResult[] | undefined,
    };
}

// Normalize URL
function normalizeUrl(url: string): string {
    let normalized = url.trim().toLowerCase();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
        normalized = "https://" + normalized;
    }
    normalized = normalized.replace(/\/$/, "");
    return normalized;
}

// Extract internal links from HTML for crawling
function extractInternalLinks(html: string, baseUrl: string): string[] {
    const links: Set<string> = new Set();
    const baseUrlObj = new URL(baseUrl);
    const baseDomain = baseUrlObj.hostname;

    // Extract href attributes
    const hrefRegex = /href\s*=\s*["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
        try {
            const href = match[1];
            // Skip anchors, javascript, mailto, tel
            if (href.startsWith("#") || href.startsWith("javascript:") ||
                href.startsWith("mailto:") || href.startsWith("tel:")) {
                continue;
            }

            // Resolve relative URLs
            const absoluteUrl = new URL(href, baseUrl);

            // Only include same-domain links
            if (absoluteUrl.hostname === baseDomain) {
                // Normalize and add
                const normalized = absoluteUrl.origin + absoluteUrl.pathname.replace(/\/$/, "");
                links.add(normalized);
            }
        } catch {
            // Invalid URL, skip
        }
    }

    return Array.from(links);
}

// Prioritize healthcare-relevant pages
function prioritizePages(links: string[], baseUrl: string): string[] {
    const priorityPatterns = [
        /contact/i,
        /patient/i,
        /appointment/i,
        /schedule/i,
        /new-patient/i,
        /forms/i,
        /about/i,
        /services/i,
        /team/i,
        /staff/i,
        /doctors/i,
        /providers/i,
        /locations/i,
        /insurance/i,
        /billing/i,
        /portal/i,
    ];

    const prioritized: string[] = [];
    const others: string[] = [];

    for (const link of links) {
        if (link === baseUrl) continue; // Skip homepage, we already scan it

        const isPriority = priorityPatterns.some(pattern => pattern.test(link));
        if (isPriority) {
            prioritized.push(link);
        } else {
            others.push(link);
        }
    }

    // Return priority pages first, then others, limited to 3 (+ homepage = 4 total)
    return [...prioritized, ...others].slice(0, 3);
}

// Fetch HTML for link extraction
async function fetchHtml(url: string, timeoutMs = 8000): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "ComplyBot/2.0 (Accessibility Scanner; +https://getcomply.tech)",
                "Accept": "text/html,application/xhtml+xml",
            },
            redirect: "follow",
        });

        clearTimeout(timeoutId);
        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Call PageSpeed Insights API
async function runPageSpeedAudit(url: string): Promise<{ score: number; findings: Finding[]; title?: string }> {
    const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    apiUrl.searchParams.set("url", url);
    apiUrl.searchParams.set("category", "accessibility");
    apiUrl.searchParams.set("strategy", "desktop");

    if (PAGESPEED_API_KEY) {
        apiUrl.searchParams.set("key", PAGESPEED_API_KEY);
    }

    const response = await fetch(apiUrl.toString(), {
        headers: {
            "Accept": "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("PageSpeed API error:", errorText);
        throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const data: PageSpeedResponse = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    const lighthouseResult = data.lighthouseResult;
    if (!lighthouseResult) {
        throw new Error("No Lighthouse result returned");
    }

    const accessibilityScore = Math.round((lighthouseResult.categories?.accessibility?.score || 0) * 100);
    const audits = lighthouseResult.audits || {};
    const findings: Finding[] = [];

    // Process failed audits
    for (const [auditId, audit] of Object.entries(audits)) {
        // Skip passed audits, not applicable, or informative
        if (audit.score === 1 || audit.score === null || audit.scoreDisplayMode === "notApplicable" || audit.scoreDisplayMode === "informative") {
            continue;
        }

        const wcagInfo = WCAG_MAPPING[auditId];
        const itemCount = audit.details?.items?.length || 0;

        // Extract element snippets for context
        const elements = audit.details?.items?.slice(0, 5).map(item =>
            item.node?.snippet || item.node?.selector || ""
        ).filter(Boolean) as string[];

        const finding: Finding = {
            id: auditId,
            check: audit.title,
            severity: getSeverity(audit),
            message: audit.description.split(".")[0] + ".", // First sentence
            details: itemCount > 0 ? `${itemCount} element${itemCount > 1 ? "s" : ""} affected` : undefined,
            count: itemCount || undefined,
            pageUrl: url,
            elements: elements.length > 0 ? elements : undefined,
        };

        if (wcagInfo) {
            finding.wcagCriterion = wcagInfo.criterion;
            finding.wcagName = wcagInfo.name;
            finding.wcagLevel = wcagInfo.level;
            finding.wcagPrinciple = wcagInfo.principle;
        }

        // Add remediation hints based on audit type
        finding.remediation = getRemediation(auditId);

        findings.push(finding);
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
        score: accessibilityScore,
        findings,
        title: lighthouseResult.finalUrl,
    };
}

// Get remediation suggestions
function getRemediation(auditId: string): string {
    const remediations: Record<string, string> = {
        "color-contrast": "Increase the contrast ratio between text and background colors to at least 4.5:1 for normal text.",
        "image-alt": "Add descriptive alt text to images that convey meaning. Use empty alt=\"\" for decorative images.",
        "link-name": "Ensure all links have discernible text that describes their destination or purpose.",
        "button-name": "Add text content or aria-label to buttons so screen readers can announce their purpose.",
        "label": "Associate form inputs with labels using the 'for' attribute or by wrapping inputs in label elements.",
        "html-has-lang": "Add a lang attribute to the <html> element (e.g., lang=\"en\").",
        "html-lang-valid": "Use a valid BCP 47 language code in the lang attribute.",
        "document-title": "Add a descriptive <title> element to the page that summarizes its content.",
        "heading-order": "Structure headings in a logical order (h1, then h2, then h3, etc.) without skipping levels.",
        "bypass": "Add a 'Skip to main content' link at the beginning of the page.",
        "frame-title": "Add title attributes to iframe elements that describe their content.",
        "meta-viewport": "Remove user-scalable=no from the viewport meta tag to allow zooming.",
        "aria-allowed-attr": "Only use ARIA attributes that are valid for the element's role.",
        "aria-hidden-body": "Remove aria-hidden from the body element or its ancestors.",
        "aria-hidden-focus": "Ensure elements with aria-hidden=\"true\" don't contain focusable elements.",
        "aria-required-attr": "Add all required ARIA attributes for the element's role.",
        "aria-required-children": "Ensure ARIA parent roles contain their required child roles.",
        "aria-required-parent": "Ensure ARIA child roles are contained within required parent roles.",
        "aria-roles": "Use valid ARIA role values.",
        "aria-valid-attr-value": "Use valid values for ARIA attributes.",
        "aria-valid-attr": "Use valid ARIA attribute names.",
        "tabindex": "Avoid using tabindex values greater than 0.",
        "duplicate-id-aria": "Ensure all IDs used in ARIA attributes are unique.",
        "video-caption": "Add captions to video elements for deaf or hard-of-hearing users.",
        "td-headers-attr": "Ensure table cells reference valid header cells using the headers attribute.",
        "th-has-data-cells": "Ensure table header cells are associated with data cells.",
    };

    return remediations[auditId] || "Review the element and ensure it meets WCAG accessibility guidelines.";
}

// Calculate summary from findings
function calculateSummary(findings: Finding[], accessibilityScore?: number): Summary {
    return {
        total: findings.length,
        critical: findings.filter((f) => f.severity === "critical").length,
        high: findings.filter((f) => f.severity === "high").length,
        medium: findings.filter((f) => f.severity === "medium").length,
        low: findings.filter((f) => f.severity === "low").length,
        accessibilityScore,
    };
}

// Get top issue for teaser
function getTopIssue(findings: Finding[]): string {
    if (findings.length === 0) return "No issues found";
    return findings[0]?.message || "Accessibility issues detected";
}

// Main handler
serve(async (req) => {
    const origin = req.headers.get("origin");
    const headers = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...headers, "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const body = await req.json();
        const { websiteUrl, sessionId } = body;

        // Validate inputs
        if (!websiteUrl || typeof websiteUrl !== "string") {
            return new Response(
                JSON.stringify({ success: false, error: "Website URL is required" }),
                { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        if (!sessionId || typeof sessionId !== "string") {
            return new Response(
                JSON.stringify({ success: false, error: "Session ID is required" }),
                { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        const normalizedUrl = normalizeUrl(websiteUrl);

        // Basic URL validation
        try {
            new URL(normalizedUrl);
        } catch {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid URL format" }),
                { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        // Get client IP for rate limiting
        const clientIp =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // Check rate limit
        const rateLimit = await checkRateLimit(supabase, clientIp);
        if (!rateLimit.allowed) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Rate limit exceeded. Please try again later.",
                    retryAfter: 3600,
                }),
                { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        // Check for cached scan of same URL
        const cached = await getCachedScan(supabase, normalizedUrl);
        if (cached) {
            const response: ScanResponse = {
                success: true,
                sessionId: cached.sessionId,
                summary: cached.summary,
                teaser: {
                    topIssue: getTopIssue(cached.findings),
                    issueCount: cached.summary.total,
                    accessibilityScore: cached.summary.accessibilityScore,
                },
                pagesScanned: cached.pageResults?.length || 1,
                cached: true,
            };
            return new Response(JSON.stringify(response), {
                headers: { ...headers, "Content-Type": "application/json" },
            });
        }

        const startTime = Date.now();
        const pageResults: PageResult[] = [];
        const allFindings: Finding[] = [];
        let totalScore = 0;

        // Step 1: Scan homepage with PageSpeed Insights
        console.log(`Scanning homepage: ${normalizedUrl}`);

        try {
            const homepageResult = await runPageSpeedAudit(normalizedUrl);

            pageResults.push({
                pageUrl: normalizedUrl,
                pageTitle: "Homepage",
                accessibilityScore: homepageResult.score,
                findings: homepageResult.findings,
                summary: calculateSummary(homepageResult.findings, homepageResult.score),
            });

            allFindings.push(...homepageResult.findings);
            totalScore = homepageResult.score;

            // Step 2: Extract internal links and crawl additional pages
            try {
                const html = await fetchHtml(normalizedUrl);
                const internalLinks = extractInternalLinks(html, normalizedUrl);
                const pagesToScan = prioritizePages(internalLinks, normalizedUrl);

                console.log(`Found ${internalLinks.length} internal links, scanning ${pagesToScan.length} priority pages`);

                // Check if we have enough time left for sub-pages
                const elapsed = Date.now() - startTime;
                if (elapsed > 20000) { // If homepage took > 20s, skip sub-pages
                    console.log("Homepage scan took too long, skipping sub-pages to avoid timeout");
                } else {
                    // Scan additional pages (limit to 2 max to save time/memory)
                    const limit = 2;
                    let scannedCount = 0;

                    for (const pageUrl of pagesToScan) {
                        if (scannedCount >= limit) break;

                        // Check time again before each scan
                        if (Date.now() - startTime > 45000) {
                            console.log("Approaching timeout, stopping scan");
                            break;
                        }

                        try {
                            console.log(`Scanning page: ${pageUrl}`);
                            const pageResult = await runPageSpeedAudit(pageUrl);

                            // Extract page name from URL
                            const pageName = new URL(pageUrl).pathname.split("/").filter(Boolean).pop() || "Page";

                            pageResults.push({
                                pageUrl,
                                pageTitle: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, " "),
                                accessibilityScore: pageResult.score,
                                findings: pageResult.findings,
                                summary: calculateSummary(pageResult.findings, pageResult.score),
                            });

                            allFindings.push(...pageResult.findings);
                            totalScore += pageResult.score;
                            scannedCount++;
                        } catch (pageError) {
                            console.error(`Error scanning ${pageUrl}:`, pageError);
                        }
                    }
                }
            } catch (crawlError) {
                console.error("Error crawling for additional pages:", crawlError);
                // Continue with just homepage results
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("PageSpeed API error:", errorMessage);

            // Store failed scan attempt
            await supabase.from("scan_results").insert({
                session_id: sessionId,
                website_url: normalizedUrl,
                client_ip: clientIp,
                http_status: 0,
                scan_duration_ms: Date.now() - startTime,
                findings: [],
                summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
                scanner_version: "2.0-psi",
            });

            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Could not scan website: ${errorMessage}`,
                }),
                { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        // Calculate overall summary
        const avgScore = pageResults.length > 0 ? Math.round(totalScore / pageResults.length) : 0;
        const overallSummary = calculateSummary(allFindings, avgScore);
        const scanDuration = Date.now() - startTime;

        // Deduplicate findings by id+pageUrl for storage (keep all for detail, but summary should reflect unique issues)
        const uniqueIssueTypes = new Set(allFindings.map(f => f.id));

        // Store results
        const { error: insertError } = await supabase.from("scan_results").insert({
            session_id: sessionId,
            website_url: normalizedUrl,
            client_ip: clientIp,
            http_status: 200,
            scan_duration_ms: scanDuration,
            findings: allFindings,
            summary: overallSummary,
            page_results: pageResults,
            pages_scanned: pageResults.length,
            scanner_version: "2.0-psi",
        });

        if (insertError) {
            console.error("Insert error:", insertError);
            if (!insertError.message.includes("duplicate")) {
                throw insertError;
            }
        }

        const response: ScanResponse = {
            success: true,
            sessionId,
            summary: overallSummary,
            teaser: {
                topIssue: getTopIssue(allFindings),
                issueCount: uniqueIssueTypes.size,
                accessibilityScore: avgScore,
            },
            pagesScanned: pageResults.length,
            pageResults,
        };

        console.log(`Scan completed for ${normalizedUrl}: ${allFindings.length} issues found across ${pageResults.length} pages in ${scanDuration}ms (avg score: ${avgScore})`);

        return new Response(JSON.stringify(response), {
            headers: { ...headers, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Scan error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            }),
            { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
    }
});

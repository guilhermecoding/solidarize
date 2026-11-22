"use client";

import {
    Suspense,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { UserCircleIcon } from "@hugeicons/core-free-icons";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react";

import { MobileNavUser, type NavUserInfo } from "@/components/nav-user";
import { cn } from "@/lib/utils";

export type MobileNavSectionEntry = {
    id: string;
    label: string;
    href: string;
    icon: IconSvgElement;
    matchUrls: string[];
};

type MobileBottomNavProps = {
    home: {
        label: string;
        href: string;
        icon: IconSvgElement;
    };
    sections: MobileNavSectionEntry[];
    user: NavUserInfo;
};

type NavSlot =
    | {
        kind: "link";
        id: string;
        label: string;
        href: string;
        icon: IconSvgElement;
    }
    | {
        kind: "user";
        id: "user";
        label: string;
        icon: IconSvgElement;
    };

const BAR_HEIGHT = 64;
const CONTAINER_HEIGHT = 90;
const CORNER_RADIUS = 22;
const INNER_PAD = 12;
const CIRCLE_SIZE = 48;
const NOTCH_DEPTH = 33;
const DEFAULT_BAR_WIDTH = 344;

function buildNotchedBarPath(
    width: number,
    height: number,
    radius: number,
    cx: number,
    notchHalfWidth: number,
    notchDepth: number,
): string {
    const w = Math.max(width, radius * 2 + 40);
    const r = Math.min(radius, w / 4, height / 2);
    const safeCx = Math.min(Math.max(cx, r + 18), w - r - 18);
    const xL = Math.max(r, safeCx - notchHalfWidth);
    const xR = Math.min(w - r, safeCx + notchHalfWidth);
    const leftSpan = safeCx - xL;
    const rightSpan = xR - safeCx;

    const c1x = xL + leftSpan * 0.44;
    const c2x = safeCx - leftSpan * 0.48;
    const c3x = safeCx + rightSpan * 0.48;
    const c4x = xR - rightSpan * 0.44;

    return [
        `M 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `L ${xL} 0`,
        `C ${c1x} 0 ${c2x} ${notchDepth} ${safeCx} ${notchDepth}`,
        `C ${c3x} ${notchDepth} ${c4x} 0 ${xR} 0`,
        `L ${w - r} 0`,
        `Q ${w} 0 ${w} ${r}`,
        `L ${w} ${height - r}`,
        `Q ${w} ${height} ${w - r} ${height}`,
        `L ${r} ${height}`,
        `Q 0 ${height} 0 ${height - r}`,
        "Z",
    ].join(" ");
}

function normalizePath(path: string): string {
    if (path === "/") {
        return "/";
    }

    return path.replace(/\/+$/, "");
}

function resolveRouteActiveIndex(
    pathname: string | null,
    sections: MobileNavSectionEntry[],
): number {
    if (!pathname) {
        return 0;
    }

    const current = normalizePath(pathname);

    if (current === "/") {
        return 0;
    }

    const sectionIndex = sections.findIndex((section) => {
        const sectionHref = normalizePath(section.href);

        if (current === sectionHref || current.startsWith(`${sectionHref}/`)) {
            return true;
        }

        return section.matchUrls.some((rawUrl) => {
            const target = normalizePath(rawUrl);
            return current === target || current.startsWith(`${target}/`);
        });
    });

    return sectionIndex >= 0 ? sectionIndex + 1 : 0;
}

function MobileBottomNavInner({
    home,
    sections,
    user,
    pathname,
}: MobileBottomNavProps & { pathname: string | null }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [barWidth, setBarWidth] = useState(DEFAULT_BAR_WIDTH);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    useLayoutEffect(() => {
        const element = containerRef.current;

        if (!element) {
            return;
        }

        const updateWidth = () => {
            const nextWidth = Math.round(element.getBoundingClientRect().width);
            if (nextWidth > 0) {
                setBarWidth(nextWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const slots: NavSlot[] = [
        {
            kind: "link",
            id: "home",
            label: home.label,
            href: home.href,
            icon: home.icon,
        },
        ...sections.map((section) => ({
            kind: "link" as const,
            id: section.id,
            label: section.label,
            href: section.href,
            icon: section.icon,
        })),
        {
            kind: "user",
            id: "user",
            label: "Menu do usuário",
            icon: UserCircleIcon,
        },
    ];

    const routeActiveIndex = resolveRouteActiveIndex(pathname, sections);
    const activeIndex = userMenuOpen ? slots.length - 1 : routeActiveIndex;
    const activeSlot = slots[activeIndex] ?? slots[0];

    const slotWidth = (barWidth - INNER_PAD * 2) / slots.length;
    const targetCx = INNER_PAD + (activeIndex + 0.5) * slotWidth;
    const notchHalfWidth = Math.min(42, Math.max(30, slotWidth * 0.52));

    const notchX = useMotionValue(targetCx);
    const smoothX = useSpring(
        notchX,
        prefersReducedMotion
            ? { stiffness: 1000, damping: 100 }
            : { stiffness: 380, damping: 32, mass: 0.8 },
    );

    const prevActiveIndexRef = useRef(activeIndex);

    useEffect(() => {
        if (prevActiveIndexRef.current !== activeIndex) {
            prevActiveIndexRef.current = activeIndex;
            notchX.set(targetCx);
            return;
        }

        notchX.jump(targetCx);
    }, [activeIndex, targetCx, notchX]);

    const pathD = useTransform(smoothX, (x) =>
        buildNotchedBarPath(
            barWidth,
            BAR_HEIGHT,
            CORNER_RADIUS,
            x,
            notchHalfWidth,
            NOTCH_DEPTH,
        ),
    );
    const circleX = useTransform(smoothX, (x) => x - CIRCLE_SIZE / 2);

    return (
        <nav
            aria-label="Navegação mobile"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
            <div
                ref={containerRef}
                style={{ height: `${CONTAINER_HEIGHT}px` }}
                className="pointer-events-auto relative mx-auto w-full max-w-md"
            >
                <svg
                    width={barWidth}
                    height={BAR_HEIGHT}
                    viewBox={`0 0 ${barWidth} ${BAR_HEIGHT}`}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-16 w-full overflow-visible drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                >
                    <motion.path d={pathD} className="fill-primary" />
                </svg>

                <motion.div
                    aria-hidden="true"
                    style={{ x: circleX }}
                    className="pointer-events-none absolute top-[2px] left-0 flex size-12 items-center justify-center rounded-full bg-primary text-background shadow-md"
                >
                    <motion.span
                        key={activeSlot.id}
                        initial={
                            prefersReducedMotion
                                ? false
                                : { scale: 0.7, opacity: 0, y: 6 }
                        }
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-center justify-center"
                    >
                        <HugeiconsIcon
                            icon={activeSlot.icon}
                            strokeWidth={2}
                            className="size-[22px]"
                        />
                    </motion.span>
                </motion.div>

                <div
                    className="absolute inset-x-0 bottom-0 flex h-16 items-center"
                    style={{ paddingInline: `${INNER_PAD}px` }}
                >
                    {slots.map((slot, index) => {
                        const isElevated = index === activeIndex;

                        if (slot.kind === "link") {
                            const isRouteActive = index === routeActiveIndex;

                            return (
                                <Link
                                    key={slot.id}
                                    href={slot.href}
                                    aria-label={slot.label}
                                    aria-current={isRouteActive ? "page" : undefined}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="relative flex h-full flex-1 items-center justify-center rounded-xl text-background/65 transition-colors outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                                >
                                    <span
                                        className={cn(
                                            "flex items-center justify-center transition-all duration-150",
                                            isElevated
                                                ? "scale-75 opacity-0"
                                                : "scale-100 opacity-100",
                                        )}
                                    >
                                        <HugeiconsIcon
                                            icon={slot.icon}
                                            strokeWidth={2}
                                            className="size-[22px]"
                                        />
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <MobileNavUser
                                key={slot.id}
                                user={user}
                                open={userMenuOpen}
                                onOpenChange={setUserMenuOpen}
                                trigger={
                                    <button
                                        type="button"
                                        aria-label={slot.label}
                                        className="relative flex h-full flex-1 cursor-pointer items-center justify-center rounded-xl text-background/65 transition-colors outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                                    >
                                        <span
                                            className={cn(
                                                "flex items-center justify-center transition-all duration-150",
                                                isElevated
                                                    ? "scale-75 opacity-0"
                                                    : "scale-100 opacity-100",
                                            )}
                                        >
                                            <HugeiconsIcon
                                                icon={slot.icon}
                                                strokeWidth={2}
                                                className="size-[22px]"
                                            />
                                        </span>
                                    </button>
                                }
                            />
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

function MobileBottomNavActive(props: MobileBottomNavProps) {
    const pathname = usePathname();

    return <MobileBottomNavInner {...props} pathname={pathname} />;
}

/**
 * Menu inferior curvo e animado exclusivo para telas mobile.
 */
export function MobileBottomNav(props: MobileBottomNavProps) {
    return (
        <Suspense fallback={<MobileBottomNavInner {...props} pathname={null} />}>
            <MobileBottomNavActive {...props} />
        </Suspense>
    );
}

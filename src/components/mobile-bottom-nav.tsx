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
import { UserAiIcon } from "@hugeicons/core-free-icons";
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

const BAR_HEIGHT = 62;
const TOP_OVERHANG = 27;
const CONTAINER_HEIGHT = TOP_OVERHANG + BAR_HEIGHT; // 89px
const CIRCLE_RADIUS = 23;
const CIRCLE_SIZE = CIRCLE_RADIUS * 2; // 46px
const NOTCH_GAP = 8;
const BOWL_RADIUS = CIRCLE_RADIUS + NOTCH_GAP; // 31px
const CIRCLE_CENTER_Y = -2; // 2px above bar top edge -> 21px dip for circle, 29px dip for bowl
const CIRCLE_TOP = TOP_OVERHANG + CIRCLE_CENTER_Y - CIRCLE_RADIUS; // 2px
const DEFAULT_FILLET = 12;
const DEFAULT_BAR_WIDTH = 344;

function getInnerPad(width: number): number {
    return Math.min(20, Math.max(14, Math.round(width * 0.055)));
}

function buildNotchedBarPath(width: number, cx: number): string {
    const w = Math.max(width, 260);
    const r = Math.min(20, Math.max(14, Math.floor(w * 0.055)));
    const minDx = Math.sqrt(
        BOWL_RADIUS * BOWL_RADIUS - CIRCLE_CENTER_Y * CIRCLE_CENTER_Y,
    );
    const safeCx = Math.min(
        Math.max(cx, r + minDx + 1),
        w - r - minDx - 1,
    );

    const calcFillet = (available: number) => {
        const maxRf =
            (available * available
                - (BOWL_RADIUS * BOWL_RADIUS
                    - CIRCLE_CENTER_Y * CIRCLE_CENTER_Y))
            / (2 * (BOWL_RADIUS + CIRCLE_CENTER_Y));
        return Math.max(0.5, Math.min(DEFAULT_FILLET, maxRf));
    };

    const rfL = calcFillet(safeCx - r);
    const rfR = calcFillet(w - r - safeCx);

    const dxL = Math.sqrt(
        (BOWL_RADIUS + rfL) ** 2 - (rfL - CIRCLE_CENTER_Y) ** 2,
    );
    const dxR = Math.sqrt(
        (BOWL_RADIUS + rfR) ** 2 - (rfR - CIRCLE_CENTER_Y) ** 2,
    );

    const xL = Math.max(r, safeCx - dxL);
    const xR = Math.min(w - r, safeCx + dxR);

    const tL = BOWL_RADIUS / (BOWL_RADIUS + rfL);
    const tR = BOWL_RADIUS / (BOWL_RADIUS + rfR);

    const txL = safeCx - dxL * tL;
    const tyL = CIRCLE_CENTER_Y + (rfL - CIRCLE_CENTER_Y) * tL;
    const txR = safeCx + dxR * tR;
    const tyR = CIRCLE_CENTER_Y + (rfR - CIRCLE_CENTER_Y) * tR;

    return [
        `M 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `L ${xL.toFixed(2)} 0`,
        `A ${rfL.toFixed(2)} ${rfL.toFixed(2)} 0 0 1 ${txL.toFixed(2)} ${tyL.toFixed(2)}`,
        `A ${BOWL_RADIUS} ${BOWL_RADIUS} 0 0 0 ${txR.toFixed(2)} ${tyR.toFixed(2)}`,
        `A ${rfR.toFixed(2)} ${rfR.toFixed(2)} 0 0 1 ${xR.toFixed(2)} 0`,
        `L ${w - r} 0`,
        `Q ${w} 0 ${w} ${r}`,
        `L ${w} ${BAR_HEIGHT - r}`,
        `Q ${w} ${BAR_HEIGHT} ${w - r} ${BAR_HEIGHT}`,
        `L ${r} ${BAR_HEIGHT}`,
        `Q 0 ${BAR_HEIGHT} 0 ${BAR_HEIGHT - r}`,
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
    const widthMv = useMotionValue(DEFAULT_BAR_WIDTH);
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
                widthMv.set(nextWidth);
                setBarWidth(nextWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, [widthMv]);

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
            icon: UserAiIcon,
        },
    ];

    const routeActiveIndex = resolveRouteActiveIndex(pathname, sections);
    const activeIndex = userMenuOpen ? slots.length - 1 : routeActiveIndex;
    const activeSlot = slots[activeIndex] ?? slots[0];

    const innerPad = getInnerPad(barWidth);
    const slotWidth = (barWidth - innerPad * 2) / slots.length;
    const targetCx = innerPad + (activeIndex + 0.5) * slotWidth;

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
        smoothX.jump(targetCx);
    }, [activeIndex, targetCx, notchX, smoothX]);

    const pathD = useTransform([smoothX, widthMv], ([x, w]: number[]) =>
        buildNotchedBarPath(w, x),
    );
    const circleX = useTransform(smoothX, (x) => x - CIRCLE_RADIUS);

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
                    className="absolute inset-x-0 bottom-0 h-15.5 w-full overflow-visible drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                >
                    <motion.path d={pathD} className="fill-primary" />
                </svg>

                <motion.div
                    aria-hidden="true"
                    style={{
                        x: circleX,
                        top: CIRCLE_TOP,
                        width: CIRCLE_SIZE,
                        height: CIRCLE_SIZE,
                    }}
                    className="pointer-events-none absolute left-0 flex items-center justify-center rounded-full bg-primary text-background shadow-sm"
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
                            className="size-7"
                        />
                    </motion.span>
                </motion.div>

                <div
                    className="absolute inset-x-0 bottom-0 flex h-15.5 items-center"
                    style={{ paddingInline: `${innerPad}px` }}
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
                                    className="relative flex h-full flex-1 items-center justify-center rounded-xl text-background transition-colors outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
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
                                            className="size-8"
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
                                        className="relative flex h-full flex-1 cursor-pointer items-center justify-center rounded-xl text-background transition-colors outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
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
                                                className="size-8"
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

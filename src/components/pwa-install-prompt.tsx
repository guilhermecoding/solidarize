"use client";

import { Suspense, type ReactNode } from "react";
import {
    AddSquareIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    Download01Icon,
    Download04Icon,
    MoreVerticalIcon,
    Share08Icon,
    SmartPhone01Icon,
    SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import IconLogo from "@/components/logo/icon-logo";
import { PwaNativeInstallButton } from "@/components/pwa-native-install-button";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    usePwaInstall,
    type ManualInstallBrowser,
} from "@/hooks/use-pwa-install";

type ManualGuideContent = {
    subtitle: string;
    steps: Array<{
        text: ReactNode;
        icon: typeof Share08Icon;
    }>;
};

function getManualGuide(browser: ManualInstallBrowser): ManualGuideContent {
    switch (browser) {
        case "ios-safari":
            return {
                subtitle: "Siga os passos no Safari para adicionar o Solidarize à tela inicial:",
                steps: [
                    {
                        icon: Share08Icon,
                        text: (
                            <>
                                Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                            </>
                        ),
                    },
                    {
                        icon: AddSquareIcon,
                        text: (
                            <>
                                Role as opções e toque em <strong>Adicionar à Tela de Início</strong>.
                            </>
                        ),
                    },
                    {
                        icon: CheckmarkCircle02Icon,
                        text: (
                            <>
                                Toque em <strong>Adicionar</strong> no canto superior direito.
                            </>
                        ),
                    },
                ],
            };
        case "ios-other":
            return {
                subtitle: "No iPhone e iPad, a instalação de sites ocorre pelo Safari ou menu de compartilhamento:",
                steps: [
                    {
                        icon: Share08Icon,
                        text: (
                            <>
                                Toque em <strong>Compartilhar</strong> ou abra este endereço no <strong>Safari</strong>.
                            </>
                        ),
                    },
                    {
                        icon: AddSquareIcon,
                        text: (
                            <>
                                Escolha <strong>Adicionar à Tela de Início</strong>.
                            </>
                        ),
                    },
                    {
                        icon: CheckmarkCircle02Icon,
                        text: (
                            <>
                                Confirme tocando em <strong>Adicionar</strong>.
                            </>
                        ),
                    },
                ],
            };
        case "android-other":
            return {
                subtitle: "Siga os passos no menu do seu navegador para instalar o site:",
                steps: [
                    {
                        icon: MoreVerticalIcon,
                        text: (
                            <>
                                Toque no menu do navegador (<strong>⋮</strong>) no canto superior.
                            </>
                        ),
                    },
                    {
                        icon: AddSquareIcon,
                        text: (
                            <>
                                Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>. Pode aparecer
                                um icone de <strong>Instalar</strong> no canto superior direito.
                            </>
                        ),
                    },
                    {
                        icon: CheckmarkCircle02Icon,
                        text: (
                            <>
                                Confirme tocando em <strong>Instalar</strong>.
                            </>
                        ),
                    },
                ],
            };
        case "generic":
            return {
                subtitle: "Use o menu do navegador para adicionar o site à tela inicial:",
                steps: [
                    {
                        icon: MoreVerticalIcon,
                        text: (
                            <>
                                Abra as opções ou o menu de compartilhamento do navegador.
                            </>
                        ),
                    },
                    {
                        icon: AddSquareIcon,
                        text: (
                            <>
                                Toque em <strong>Instalar</strong> ou <strong>Adicionar à tela inicial</strong>.
                            </>
                        ),
                    },
                ],
            };
    }
}

function PwaInstallPromptInner() {
    const prefersReducedMotion = useReducedMotion();
    const {
        modalOpen,
        showCornerBanner,
        capability,
        manualBrowser,
        showManualGuide,
        isInstalling,
        setShowManualGuide,
        openPrompt,
        deferInstall,
        dismissCornerBanner,
        handleInstallClick,
        handleNativeInstalled,
    } = usePwaInstall();

    const guide = getManualGuide(manualBrowser);

    return (
        <>
            <AnimatePresence>
                {showCornerBanner ? (
                    <motion.div
                        key="pwa-install-corner-banner"
                        initial={
                            prefersReducedMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: -12, scale: 0.96 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            prefersReducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: -8, scale: 0.96 }
                        }
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-40 md:hidden"
                    >
                        <div className="flex items-center gap-1 rounded-full border border-border/80 bg-popover/95 py-1 pr-1 pl-2.5 text-popover-foreground shadow-md backdrop-blur-md">
                            <button
                                type="button"
                                onClick={openPrompt}
                                className="flex cursor-pointer items-center gap-1.5 rounded-full py-0.5 pr-1 text-left transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <IconLogo className="size-4 shrink-0" />
                                <span className="text-xs font-medium whitespace-nowrap">
                                    Instale o Solidarize
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={dismissCornerBanner}
                                aria-label="Remover aviso de instalação"
                                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    strokeWidth={2}
                                    className="size-3.5"
                                />
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <Dialog
                open={modalOpen}
                disablePointerDismissal={isInstalling}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        deferInstall();
                    }
                }}
            >
                <DialogContent
                    showCloseButton={!isInstalling}
                    className="md:hidden"
                >
                    {!showManualGuide ? (
                        <>
                            <DialogHeader className="items-center text-center">
                                <div className="mb-1 flex size-16 items-center justify-center rounded-2xl border bg-muted/50 shadow-xs">
                                    <IconLogo className="size-10" />
                                </div>
                                <DialogTitle className="font-young-serif text-xl font-normal">
                                    Instale o Solidarize
                                </DialogTitle>
                                <DialogDescription className="text-center leading-relaxed">
                                    O Solidarize não é um aplicativo — ele é um{" "}
                                    <strong className="font-medium text-foreground">site</strong> que
                                    pode ser instalado no seu celular para melhorar a experiência.
                                </DialogDescription>
                            </DialogHeader>

                            <ul className="flex flex-col gap-2.5 rounded-2xl border bg-muted/35 p-3.5 text-xs text-muted-foreground">
                                <li className="flex items-center gap-2.5">
                                    <HugeiconsIcon
                                        icon={SmartPhone01Icon}
                                        strokeWidth={2}
                                        className="size-4 shrink-0 text-primary"
                                    />
                                    <span>Acesso rápido direto na tela inicial</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <HugeiconsIcon
                                        icon={SparklesIcon}
                                        strokeWidth={2}
                                        className="size-4 shrink-0 text-primary"
                                    />
                                    <span>Navegação em tela cheia, como um app nativo</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle02Icon}
                                        strokeWidth={2}
                                        className="size-4 shrink-0 text-primary"
                                    />
                                    <span>Carregamento mais ágil sem ocupar memória do seu dispositivo</span>
                                </li>
                            </ul>

                            <div data-slot="dialog-footer" className="flex w-full flex-col gap-2">
                                {capability === "html-install-element" ? (
                                    <PwaNativeInstallButton
                                        onInstalled={handleNativeInstalled}
                                        onDismissed={deferInstall}
                                    />
                                ) : (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        loading={isInstalling}
                                        loadingText="Instalando..."
                                        onClick={handleInstallClick}
                                    >
                                        <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
                                        Instalar
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={isInstalling}
                                    onClick={deferInstall}
                                >
                                    Mais tarde
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader className="items-center text-center">
                                <div className="mb-1 flex size-14 items-center justify-center rounded-2xl border bg-muted/50 shadow-xs">
                                    <IconLogo className="size-9" />
                                </div>
                                <DialogTitle className="font-young-serif text-xl font-normal">
                                    Como instalar o Solidarize
                                </DialogTitle>
                                <DialogDescription className="text-center leading-relaxed">
                                    {guide.subtitle}
                                </DialogDescription>
                            </DialogHeader>

                            <ol className="flex flex-col gap-3 rounded-2xl border bg-muted/35 p-3.5 text-sm">
                                {guide.steps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1 text-muted-foreground">
                                            {step.text}
                                        </span>
                                        <HugeiconsIcon
                                            icon={step.icon}
                                            strokeWidth={2}
                                            className="mt-0.5 size-4 shrink-0 text-foreground/70"
                                        />
                                    </li>
                                ))}
                            </ol>

                            <div data-slot="dialog-footer" className="flex w-full flex-col gap-2">
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={deferInstall}
                                >
                                    Entendi
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowManualGuide(false)}
                                >
                                    Voltar
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * Exibe o pop-up único de instalação do PWA e o selo compacto superior em dispositivos móveis.
 */
export function PwaInstallPrompt() {
    return (
        <Suspense fallback={null}>
            <PwaInstallPromptInner />
        </Suspense>
    );
}

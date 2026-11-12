import "dotenv/config";

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

import prisma from "@/lib/prisma";

const BASE = "http://localhost:3000";
const NAME = "Exclusão Senha Verificação";
const email = process.env.PRIMARY_USER_EMAIL ?? "";
const password = process.env.PRIMARY_USER_PASSWORD ?? "";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

class Cdp {
    private id = 0;
    private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
    logs: string[] = [];

    constructor(private socket: WebSocket) {
        socket.addEventListener("message", (event) => {
            const message = JSON.parse(String(event.data)) as {
                id?: number;
                result?: unknown;
                error?: { message: string };
                method?: string;
                params?: { args?: Array<{ value?: string; description?: string }> };
            };

            if (message.id && this.pending.has(message.id)) {
                const waiter = this.pending.get(message.id)!;
                this.pending.delete(message.id);

                if (message.error) {
                    waiter.reject(new Error(message.error.message));
                    return;
                }

                waiter.resolve(message.result);
            }

            if (message.method === "Runtime.consoleAPICalled" || message.method === "Runtime.exceptionThrown") {
                this.logs.push(JSON.stringify(message.params));
            }
        });
    }

    send<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
        const id = ++this.id;
        this.socket.send(JSON.stringify({ id, method, params }));

        return new Promise((resolve, reject) => {
            this.pending.set(id, {
                resolve: (value) => resolve(value as T),
                reject,
            });
        });
    }

    async evaluate<T>(expression: string): Promise<T> {
        const result = await this.send<{ result: { value?: T }; exceptionDetails?: { text: string } }>(
            "Runtime.evaluate",
            { expression, returnByValue: true, awaitPromise: true },
        );

        if (result.exceptionDetails) {
            throw new Error(result.exceptionDetails.text);
        }

        return result.result.value as T;
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(cdp: Cdp, expression: string, timeout = 20000) {
    const started = Date.now();

    while (Date.now() - started < timeout) {
        try {
            if (await cdp.evaluate<boolean>(expression)) {
                return;
            }
        } catch {
            // A navegação descarta o contexto até a próxima página.
        }

        await sleep(200);
    }

    const text = await cdp.evaluate<string>("document.body ? document.body.innerText.slice(0, 1200) : ''").catch(() => "");
    throw new Error(`Tempo esgotado.\n${expression}\n${text}`);
}

async function boxOf(cdp: Cdp, expression: string) {
    return cdp.evaluate<{ x: number; y: number } | null>(`(() => {
        const node = ${expression};
        if (!node) return null;
        node.scrollIntoView({ block: "center" });
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    })()`);
}

async function pressAt(cdp: Cdp, x: number, y: number) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function clickExpression(cdp: Cdp, expression: string) {
    const box = await boxOf(cdp, expression);
    assert(box, `Não encontrou o alvo: ${expression}`);
    await pressAt(cdp, box.x, box.y);
}

async function clickButton(cdp: Cdp, label: string) {
    await clickExpression(cdp, `Array.from(document.querySelectorAll("button")).find((button) => button.textContent.trim() === ${JSON.stringify(label)} && button.getClientRects().length > 0)`);
}

async function login(cdp: Cdp) {
    await cdp.evaluate(`location.href = ${JSON.stringify(`${BASE}/entrar`)}`);
    await waitFor(cdp, `(() => {
        if (!document.querySelector("#email")) return false;
        if (!window.__quiet) {
            window.__quiet = { at: Date.now() };
            new MutationObserver(() => { window.__quiet.at = Date.now(); }).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
        }
        return Date.now() - window.__quiet.at > 800;
    })()`);
    await cdp.evaluate(`(() => {
        const setValue = (id, value) => {
            const input = document.getElementById(id);
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, value);
            input.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
        };
        setValue("email", ${JSON.stringify(email)});
        setValue("password", ${JSON.stringify(password)});
    })()`);
    await clickExpression(cdp, `document.querySelector('button[type="submit"]')`);
    await waitFor(cdp, "location.pathname === '/inicio'");
}

async function main() {
    assert(email && password, "Credenciais do administrador ausentes.");
    await prisma.beneficiary.deleteMany({ where: { name: NAME } });
    await prisma.beneficiary.create({
        data: {
            name: NAME,
            street: "Rua da Verificação",
            neighborhood: "Centro",
            city: "Campinas",
            state: "SP",
            dateOfBirth: new Date(Date.UTC(1990, 0, 1)),
            gender: "unspecified",
            maritalStatus: "single",
            employment: "unemployed",
            status: "approved",
            aidType: "food_basket",
            contacts: { create: [{ phone: "11988887777", position: 0 }] },
        },
    });

    const profile = await mkdtemp(join(tmpdir(), "solidarize-browser-"));
    const chrome: ChildProcess = spawn("/usr/bin/google-chrome", [
        "--headless=new",
        "--remote-debugging-port=9334",
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1440,1000",
        "about:blank",
    ], { stdio: "ignore" });

    try {
        let socketUrl = "";

        for (let attempt = 0; attempt < 40 && !socketUrl; attempt += 1) {
            await sleep(250);

            try {
                const response = await fetch("http://127.0.0.1:9334/json/version");
                const version = await response.json() as { webSocketDebuggerUrl: string };
                socketUrl = version.webSocketDebuggerUrl;
            } catch {
                socketUrl = "";
            }
        }

        assert(socketUrl, "O navegador não abriu a porta de depuração.");
        const targets = await fetch("http://127.0.0.1:9334/json/list").then((response) => response.json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
        const pageTarget = targets.find((target) => target.type === "page");
        assert(pageTarget, "O navegador não abriu uma página.");
        const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            socket.addEventListener("open", resolve, { once: true });
            socket.addEventListener("error", reject, { once: true });
        });
        const page = new Cdp(socket);
        await page.send("Runtime.enable");
        await page.send("Page.enable");
        await page.send("Emulation.setDeviceMetricsOverride", {
            width: 1440,
            height: 1000,
            deviceScaleFactor: 1,
            mobile: false,
        });

        await login(page);
        await page.evaluate(`location.href = ${JSON.stringify(`${BASE}/beneficiarios`)}`);
        await waitFor(page, `document.querySelector('input[placeholder="Buscar por nome ou CPF"]')?.getBoundingClientRect().width > 0`);
        await clickExpression(page, `document.querySelector('input[placeholder="Buscar por nome ou CPF"]')`);
        await page.send("Input.insertText", { text: NAME });
        await waitFor(page, `(() => {
            const button = document.querySelector(${JSON.stringify(`[aria-label="Editar ${NAME}"]`)});
            return Boolean(button && Object.getOwnPropertyNames(button).some((name) => name.startsWith("__reactProps")) && button.getBoundingClientRect().width > 0);
        })()`);
        await clickExpression(page, `document.querySelector(${JSON.stringify(`[aria-label="Editar ${NAME}"]`)})`);
        await waitFor(page, "document.body.innerText.includes('Excluir Beneficiário')");
        await page.evaluate(`Array.from(document.querySelectorAll("button")).find((button) => button.textContent.trim() === "Excluir Beneficiário").click()`);
        await waitFor(page, "document.body.innerText.includes('Tem certeza disso?')");
        await page.evaluate(`Array.from(document.querySelectorAll("button")).find((button) => button.textContent.trim() === "Confirmar" && button.getClientRects().length > 0).click()`);
        await waitFor(page, "document.body.innerText.includes('Digite a sua senha para confirmar a ação.')");
        console.log("senha de administrador: ok");

        await page.evaluate(`(() => {
            const input = document.querySelector('#admin-password-form input[name="password"]');
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, "errada12");
            input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })()`);
        await waitFor(page, `document.querySelector('button[form="admin-password-form"]') && !document.querySelector('button[form="admin-password-form"]').disabled`);
        await clickExpression(page, `document.querySelector('button[form="admin-password-form"]')`);
        await waitFor(page, "document.body.innerText.includes('Senha incorreta.')");
        const stillThere = await prisma.beneficiary.findFirst({ where: { name: NAME }, select: { id: true } });
        assert(stillThere, "A senha incorreta excluiu o beneficiário.");
        console.log("senha incorreta: ok");

        await page.evaluate(`(() => {
            const input = document.querySelector('#admin-password-form input[name="password"]');
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, ${JSON.stringify(password)});
            input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })()`);
        await waitFor(page, `document.querySelector('button[form="admin-password-form"]') && !document.querySelector('button[form="admin-password-form"]').disabled`);
        await clickExpression(page, `document.querySelector('button[form="admin-password-form"]')`);
        await waitFor(page, `!document.body.innerText.includes(${JSON.stringify(NAME)})`);
        const removed = await prisma.beneficiary.findFirst({ where: { name: NAME }, select: { id: true } });
        assert(!removed, "O beneficiário continuou no banco depois da senha correta.");
        console.log("exclusão com senha: ok");
        socket.close();
    } finally {
        await prisma.beneficiary.deleteMany({ where: { name: NAME } });
        chrome.kill("SIGKILL");
        await sleep(300);
        await rm(profile, { recursive: true, force: true }).catch(() => undefined);
        await prisma.$disconnect();
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});

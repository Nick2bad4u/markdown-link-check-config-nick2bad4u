import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import defaultConfig, {
    createMarkdownLinkCheckConfig,
    getMarkdownLinkCheckConfigPath,
    loadMarkdownLinkCheckConfig,
    type MarkdownLinkCheckPreset,
    markdownLinkCheckPresets,
} from "../src/markdown-link-check-config.js";

const fixture = { origin: "", root: "" };
const server = createServer((request, response) => {
    if (request.url === "/healthy") {
        response.writeHead(200, { "content-type": "text/plain" });
        response.end("ok");
        return;
    }

    response.writeHead(404, { "content-type": "text/plain" });
    response.end("missing");
});

beforeAll(async () => {
    fixture.root = await mkdtemp(path.join(tmpdir(), "markdown-link-check-"));
    await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (address === null || typeof address === "string") {
        throw new TypeError("Expected a TCP server address.");
    }
    // eslint-disable-next-line sdl/no-insecure-url -- isolated loopback fixture intentionally uses a plain HTTP server
    fixture.origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
    await rm(fixture.root, { force: true, recursive: true });
});

async function runCli(markdownPath: string): Promise<{
    readonly code: null | number;
    readonly stderr: string;
    readonly stdout: string;
}> {
    const cliPath = fileURLToPath(
        new URL(
            "../node_modules/markdown-link-check/markdown-link-check",
            import.meta.url
        )
    );

    return await new Promise((resolve, reject) => {
        const child = spawn(
            process.execPath,
            [
                cliPath,
                "--config",
                getMarkdownLinkCheckConfigPath(),
                markdownPath,
            ],
            { cwd: fixture.root }
        );
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
            stdout += chunk;
        });
        child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
            stderr += chunk;
        });
        child.once("error", reject);
        child.once("close", (code) => {
            resolve({ code, stderr, stdout });
        });
    });
}

describe("markdown-link-check presets", () => {
    it.each(markdownLinkCheckPresets)(
        "loads the %s JSON preset",
        async (preset) => {
            const configPath = getMarkdownLinkCheckConfigPath(preset);
            const raw = JSON.parse(await readFile(configPath, "utf8"));

            expect(path.isAbsolute(configPath)).toBe(true);
            await expect(
                loadMarkdownLinkCheckConfig(preset)
            ).resolves.toStrictEqual(raw);
        }
    );

    it("keeps the root default aligned with recommended", async () => {
        expect(defaultConfig).toStrictEqual(
            await loadMarkdownLinkCheckConfig("recommended")
        );
    });

    it("replaces preset arrays with consumer overrides", () => {
        const config = createMarkdownLinkCheckConfig("github", {
            aliveStatusCodes: [204],
            ignorePatterns: [],
        });

        expect(config.aliveStatusCodes).toStrictEqual([204]);
        expect(config.ignorePatterns).toStrictEqual([]);
        expect(config.httpHeaders).toHaveLength(1);
    });

    it("rejects invented presets", () => {
        expect(() =>
            getMarkdownLinkCheckConfigPath("offline" as MarkdownLinkCheckPreset)
        ).toThrow(RangeError);
    });

    it("passes a real CLI check against a healthy local endpoint", async () => {
        const markdownPath = path.join(fixture.root, "healthy.md");
        await writeFile(markdownPath, `[healthy](${fixture.origin}/healthy)\n`);

        const result = await runCli(markdownPath);

        expect(result.code).toBe(0);
        expect(result.stdout).toContain("1 link checked");
    });

    it("fails a real CLI check for a dead local endpoint", async () => {
        const markdownPath = path.join(fixture.root, "missing.md");
        await writeFile(markdownPath, `[missing](${fixture.origin}/missing)\n`);

        const result = await runCli(markdownPath);

        expect(result.code).toBe(1);
        expect(result.stdout).toContain("Status: 404");
    });
});

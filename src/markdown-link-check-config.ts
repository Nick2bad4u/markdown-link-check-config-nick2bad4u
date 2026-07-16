import { fileURLToPath } from "node:url";
import { arrayIncludes, arrayJoin } from "ts-extras";

import githubConfig from "../presets/github.json" with { type: "json" };
import lenientConfig from "../presets/lenient.json" with { type: "json" };
import recommendedConfig from "../presets/recommended.json" with { type: "json" };
import strictConfig from "../presets/strict.json" with { type: "json" };

/** URL-specific HTTP headers. */
export interface LinkCheckHeaders {
    readonly headers: Readonly<Record<string, string>>;
    readonly urls: readonly string[];
}

/** A pattern understood by markdown-link-check's JSON configuration loader. */
export interface LinkPattern {
    readonly global?: boolean;
    readonly pattern: string;
    readonly replacement?: string;
}

/** Portable markdown-link-check configuration. */
export interface MarkdownLinkCheckConfig {
    readonly aliveStatusCodes?: readonly number[];
    readonly fallbackRetryDelay?: string;
    readonly httpHeaders?: readonly LinkCheckHeaders[];
    readonly ignoreDisable?: boolean;
    readonly ignorePatterns?: readonly LinkPattern[];
    readonly projectBaseUrl?: string;
    readonly replacementPatterns?: readonly LinkPattern[];
    readonly retryCount?: number;
    readonly retryOn429?: boolean;
    readonly timeout?: string;
}

/** Bundled policy choices. */
export type MarkdownLinkCheckPreset =
    | "github"
    | "lenient"
    | "recommended"
    | "strict";

/** All bundled preset names in stable display order. */
export const markdownLinkCheckPresets: readonly MarkdownLinkCheckPreset[] =
    Object.freeze([
        "recommended",
        "strict",
        "github",
        "lenient",
    ]);

const presetConfigs: Readonly<
    Record<MarkdownLinkCheckPreset, MarkdownLinkCheckConfig>
> = {
    github: githubConfig,
    lenient: lenientConfig,
    recommended: recommendedConfig,
    strict: strictConfig,
};

const presetPaths: Readonly<Record<MarkdownLinkCheckPreset, string>> = {
    github: fileURLToPath(new URL("../presets/github.json", import.meta.url)),
    lenient: fileURLToPath(new URL("../presets/lenient.json", import.meta.url)),
    recommended: fileURLToPath(
        new URL("../presets/recommended.json", import.meta.url)
    ),
    strict: fileURLToPath(new URL("../presets/strict.json", import.meta.url)),
};

const isPreset = (value: unknown): value is MarkdownLinkCheckPreset =>
    arrayIncludes(markdownLinkCheckPresets, value);

/**
 * Create a consumer config. Top-level arrays replace the preset arrays so a
 * consumer can deliberately tighten allowlists and ignore patterns.
 */
export function createMarkdownLinkCheckConfig(
    preset: MarkdownLinkCheckPreset = "recommended",
    overrides: Readonly<MarkdownLinkCheckConfig> = {}
): MarkdownLinkCheckConfig {
    return structuredClone({ ...presetConfigs[preset], ...overrides });
}

/**
 * Return the absolute path to one bundled JSON preset.
 *
 * @throws {@link RangeError} If `preset` is not bundled.
 */
export function getMarkdownLinkCheckConfigPath(
    preset: MarkdownLinkCheckPreset = "recommended"
): string {
    if (!isPreset(preset)) {
        throw new RangeError(
            `Unknown markdown-link-check preset: ${String(valueForMessage(preset))}. Expected one of: ${arrayJoin(markdownLinkCheckPresets, ", ")}.`
        );
    }

    return presetPaths[preset];
}

/** Load a fresh copy of one bundled JSON preset. */
export function loadMarkdownLinkCheckConfig(
    preset: MarkdownLinkCheckPreset = "recommended"
): Promise<MarkdownLinkCheckConfig> {
    return Promise.resolve(structuredClone(presetConfigs[preset]));
}

function valueForMessage(value: unknown): unknown {
    return value;
}

/** Recommended balanced policy. */
const defaultConfig: MarkdownLinkCheckConfig = Object.freeze(
    createMarkdownLinkCheckConfig()
);

export default defaultConfig;

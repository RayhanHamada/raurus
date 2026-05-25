import type { IAssetRecord, IRaurusRuntime } from "@raurus/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { EditableAsset, RaurusProvider } from "../src";

const HERO_ID = "homepage.hero.banner";

const createRecord = (url: string): IAssetRecord => ({
    assetKey: url.split("/").at(-1) ?? "hero.png",
    id: HERO_ID,
    mimeType: "image/png",
    updatedAt: "2026-05-24T00:00:00.000Z",
    url,
});

const createRuntime = (options?: {
    canEdit?: boolean;
    initialAsset?: IAssetRecord | null;
}): IRaurusRuntime => {
    let asset = options?.initialAsset ?? null;

    return {
        canEdit: vi.fn<() => Promise<boolean>>(() =>
            Promise.resolve(options?.canEdit ?? false)
        ),
        getAsset: vi.fn<(id: string) => Promise<IAssetRecord | null>>(() =>
            Promise.resolve(asset)
        ),
        removeAsset: vi.fn<(id: string) => Promise<void>>(() => {
            asset = null;
            return Promise.resolve();
        }),
        replaceAsset: vi.fn<(id: string, file: File) => Promise<IAssetRecord>>(
            (_id, file) => {
                asset = createRecord(`/uploads/${file.name}`);
                return Promise.resolve(asset);
            }
        ),
    };
};

const ExampleAsset = () => (
    <EditableAsset id={HERO_ID}>
        {({ asset, edit, isAdmin }) =>
            isAdmin ? (
                <button onClick={edit} type="button">
                    <img
                        alt="Editable hero"
                        src={asset?.url ?? "/hero-default.svg"}
                    />
                </button>
            ) : (
                <img
                    alt="Editable hero"
                    src={asset?.url ?? "/hero-default.svg"}
                />
            )
        }
    </EditableAsset>
);

describe("@raurus/react", () => {
    beforeEach(() => {
        window.history.replaceState({}, "", "/");
    });

    test("renders viewer mode without editing chrome", () => {
        render(
            <RaurusProvider runtime={createRuntime({ initialAsset: null })}>
                <ExampleAsset />
            </RaurusProvider>
        );

        expect(screen.queryByText("Editing Mode")).not.toBeInTheDocument();
        expect(screen.getByAltText("Editable hero")).toHaveAttribute(
            "src",
            "/hero-default.svg"
        );
        expect(
            screen.queryByRole("button", { name: /editable hero/iu })
        ).toBeNull();
    });

    test("enables editor mode when query parameter and permission both allow it", async () => {
        window.history.replaceState({}, "", "/?edit=true");

        render(
            <RaurusProvider runtime={createRuntime({ canEdit: true })}>
                <ExampleAsset />
            </RaurusProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Editing Mode")).toBeInTheDocument();
        });
    });

    test("opens the inspector when an asset is selected", async () => {
        window.history.replaceState({}, "", "/?edit=true");
        const user = userEvent.setup();

        render(
            <RaurusProvider runtime={createRuntime({ canEdit: true })}>
                <ExampleAsset />
            </RaurusProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Editing Mode")).toBeInTheDocument();
        });

        await user.click(screen.getByAltText("Editable hero"));

        const inspector = screen.getByLabelText("Raurus Inspector");

        expect(inspector).toBeInTheDocument();
        expect(inspector).toHaveTextContent(HERO_ID);
    });

    test("updates rendered asset state after upload", async () => {
        window.history.replaceState({}, "", "/?edit=true");
        const user = userEvent.setup();

        render(
            <RaurusProvider runtime={createRuntime({ canEdit: true })}>
                <ExampleAsset />
            </RaurusProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Editing Mode")).toBeInTheDocument();
        });

        await user.click(screen.getByAltText("Editable hero"));
        await user.upload(
            screen.getByLabelText("Upload replacement"),
            new File(["image"], "updated-hero.png", { type: "image/png" })
        );

        await waitFor(() => {
            expect(screen.getByAltText("Editable hero")).toHaveAttribute(
                "src",
                "/uploads/updated-hero.png"
            );
        });
    });

    test("clears rendered asset state after removal", async () => {
        window.history.replaceState({}, "", "/?edit=true");
        const user = userEvent.setup();

        render(
            <RaurusProvider
                runtime={createRuntime({
                    canEdit: true,
                    initialAsset: createRecord("/uploads/existing.png"),
                })}
            >
                <ExampleAsset />
            </RaurusProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Editing Mode")).toBeInTheDocument();
        });

        await user.click(screen.getByAltText("Editable hero"));
        await user.click(screen.getByText("Remove asset"));

        await waitFor(() => {
            expect(screen.getByAltText("Editable hero")).toHaveAttribute(
                "src",
                "/hero-default.svg"
            );
        });
    });
});

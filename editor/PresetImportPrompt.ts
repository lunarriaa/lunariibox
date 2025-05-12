import { HTML } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";

const { div, input, button, h2, p } = HTML;

export class PresetImportPrompt implements Prompt {
    private readonly _cancelButton: HTMLButtonElement = button({ class: "cancelButton" });
    private readonly _importButton: HTMLButtonElement = button({ class: "okayButton", style: "width: 45%;" }, "Import");
    private readonly _fileInput: HTMLInputElement = input({ type: "file", accept: ".json" });
    public readonly container: HTMLDivElement;

    constructor(private _doc: SongDocument) {
        this.container = div({ class: "prompt noSelection", style: "width: 450px; max-height: calc(100% - 100px);" },
            h2("Import Presets"),
            p({ style: "margin-bottom: 1em;" }, "Select a JSON file exported from the Export Presets dialog. Imported presets will appear in a new category in the preset menu."),
            div({ style: "width: 100%; margin-bottom: 1em; display: flex; flex-direction: row; align-items: center;" },
                this._fileInput
            ),
            div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between; margin-top: 1em;" },
                this._importButton,
            ),
            this._cancelButton,
        );
        this._importButton.addEventListener("click", this._onImportButtonClick);
        this._fileInput.addEventListener("change", this._onFileSelected);
        this._cancelButton.addEventListener("click", this._close);
    }

    private _close = (): void => {
        this._doc.prompt = null;
        this._doc.undo();
    }

    private _onImportButtonClick = (): void => {
        this._fileInput.click();
    };

    private _onFileSelected = (): void => {
        const file = this._fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                if (!Array.isArray(json)) throw new Error("Preset file must be an array.");
                const validPresets: any[] = [];
                for (const item of json) {
                    if (typeof item !== "object" || !item.name || typeof item.settings !== "object") continue;
                    validPresets.push({
                        name: item.name,
                        generalMidi: !!item.generalMidi,
                        isNoise: !!item.isNoise,
                        settings: item.settings
                    });
                }
                if (validPresets.length > 0) {
                    // Insert as a new category (appears only after import)
                    const importCategory = {
                        name: "Imported Presets",
                        presets: validPresets as any
                    };
                    if (!Array.isArray((window as any).EditorConfig?.presetCategories)) {
                        try {
                            const { EditorConfig } = require("./EditorConfig");
                            EditorConfig.presetCategories.push(importCategory);
                        } catch {}
                    } else {
                        (window as any).EditorConfig.presetCategories.push(importCategory);
                    }
                    alert("Presets imported!");
                    this._close();
                } else {
                    alert("No valid presets found in file.");
                }
            } catch (err) {
                alert("Failed to import presets: " + err);
            }
        };
        // Removed the line to prevent premature removal of the event listener.
    };

    public cleanUp = (): void => {
        this._importButton.removeEventListener("click", () => this._fileInput.click());
        this._fileInput.removeEventListener("change", this._onFileSelected);
        this._cancelButton.removeEventListener("click", this._close);
    }
}
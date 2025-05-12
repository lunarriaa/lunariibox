import { HTML } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";

const { div, input, button, h2, p } = HTML;

export class ChannelExportPrompt implements Prompt {
    private readonly _cancelButton: HTMLButtonElement = button({ class: "cancelButton" });
    private readonly _exportButton: HTMLButtonElement = button({ class: "okayButton", style: "width: 45%;" }, "Export");
    private readonly _channelCheckboxes: HTMLInputElement[] = [];
    private readonly _presetNameInputs: HTMLInputElement[] = [];
    private readonly _channelRows: HTMLDivElement[] = [];
    public exportedInstruments: { [presetName: string]: any } = {};
    public readonly container: HTMLDivElement = div();

    constructor(private _doc: SongDocument) {
        const song = this._doc.song; // Ensure _doc.song is properly initialized and has channels and getChannelIsNoise defined.
        if (!song || !Array.isArray(song.channels) || typeof song.getChannelIsNoise !== "function") {
            throw new Error("Invalid song object: Ensure 'song' is properly initialized with an array of channels and getChannelIsNoise.");
        }
        const channelList: HTMLDivElement = div();
        for (let i = 0; i < song.channels.length; i++) {
            const channel = song.channels[i];
            const channelName = channel.name || `Channel ${i + 1}`;
            const checkbox = input({ type: "checkbox", checked: false, style: "margin-right: 0.5em;" });
            const presetNameInput = input({ type: "text", placeholder: "Preset name...", style: "flex:1; display:none; margin-left:0.5em;" });
            this._channelCheckboxes.push(checkbox);
            this._presetNameInputs.push(presetNameInput);
            checkbox.addEventListener("change", () => {
                presetNameInput.style.display = checkbox.checked ? "" : "none";
            });
            const row = div({ style: "display: flex; align-items: center; margin-bottom: 0.5em;" },
                checkbox,
                div({ style: "flex: 1;" }, channelName),
                presetNameInput
            );
            this._channelRows.push(row);
            channelList.appendChild(row);
        }
        this.container = div({ class: "prompt noSelection", style: "width: 450px; max-height: calc(100% - 100px);" },
            h2("Export Presets"),
            p({ style: "margin-bottom: 1em;" }, "Select channels and enter a preset name for each. Exported presets can be imported later from the Edit menu."),
            div({ style: "width: 100%; max-height: 300px; overflow-y: auto; margin-bottom: 1em;" }, channelList),
            div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between; margin-top: 1em;" },
                this._exportButton,
            ),
            this._cancelButton,
        );
        this._cancelButton.addEventListener("click", this._close);
        this._exportButton.addEventListener("click", this._export);
    }

    private _close = (): void => {
        this._doc.prompt = null;
        this._doc.undo();
    }

    private _export = (): void => {
        this.exportedInstruments = {}; // Reset previous exports
        const exportArray: any[] = [];
        for (let i = 0; i < this._channelCheckboxes.length; i++) {
            if (this._channelCheckboxes[i].checked) {
                const presetName = this._presetNameInputs[i].value.trim();
                if (!presetName) continue;
                const channel = this._doc.song.channels[i];
                const isNoise = this._doc.song.getChannelIsNoise(i);
                if (!Array.isArray(channel.instruments)) continue;
                for (const instrument of channel.instruments) {
                    if (typeof instrument.toJsonObject !== "function") continue;
                    const instrumentCopy: any = instrument.toJsonObject();
                    const exportObj = {
                        name: presetName,
                        generalMidi: false,
                        isNoise: isNoise,
                        settings: instrumentCopy
                    };
                    exportArray.push(exportObj);
                }
            }
        }
        if (exportArray.length > 0) {
            const blob = new Blob([JSON.stringify(exportArray, null, 2)], { type: "application/json" });
            this._save(blob, "presets.json");
        }
    }

    private _save(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    public cleanUp = (): void => {
        this._cancelButton.removeEventListener("click", this._close);
        this._exportButton.removeEventListener("click", this._export);
    }
}
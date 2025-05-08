import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";
import { HTML } from "imperative-html/dist/esm/elements-strict";

const { button, div, h2, input } = HTML;

export class ChannelExportPrompt implements Prompt {
    private readonly _cancelButton: HTMLButtonElement = button({ class: "cancelButton" });
    private readonly _exportButton: HTMLButtonElement = button({ class: "exportButton", style: "width:45%;" }, "Export");
    private readonly _channelCheckboxes: HTMLInputElement[] = [];
    private readonly _presetNameInputs: HTMLInputElement[] = [];
    private readonly _channelRows: HTMLDivElement[] = [];

    /** Holds the exported instrument JSON data, keyed by preset name. */
    public exportedInstruments: { [presetName: string]: any } = {};

    public readonly container: HTMLDivElement;

    constructor(private _doc: SongDocument) {
        const song = this._doc.song;
        const channelList: HTMLDivElement = div();

        for (let i = 0; i < song.channels.length; i++) {
            const channel = song.channels[i];
            const channelName = channel.name || `Channel ${i + 1}`;
            const checkbox = input({ type: "checkbox", checked: false, style: "margin-right: 0.5em;" });
            const presetNameInput = input({ type: "text", placeholder: "Preset name...", style: "flex:1; display:none; margin-left:0.5em;" });
            this._channelCheckboxes.push(checkbox);
            this._presetNameInputs.push(presetNameInput);

            // Show/hide preset name input based on checkbox
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

        this.container = div({ class: "prompt noSelection", style: "width: 350px;" },
            h2("Export Channel Instruments"),
            div({ style: "margin-bottom: 1em;" }, "Select channels and enter a preset name for each:"),
            channelList,
            div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between; margin-top: 1em;" },
                this._exportButton,
            ),
            this._cancelButton,
        );

        this._cancelButton.addEventListener("click", this._close);
        this._exportButton.addEventListener("click", this._export);
    }

    private _close = (): void => {
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

                // Export all instruments in the channel as an array
                for (const instrument of channel.instruments) {
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

    // Helper method to trigger a download of a Blob as a file
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
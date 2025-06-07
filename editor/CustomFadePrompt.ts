import { Config } from "../synth/SynthConfig";
//import { clamp, /*Instrument, Synth*/ } from "../synth/synth";
import { SongDocument } from "./SongDocument";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
//import { ChangeSequence, UndoableChange } from "./Change";
//import { ChangeFadeInOut } from "./changes";
import { Prompt } from "./Prompt";

const { button, div, h2, p } = HTML;

export class CustomFadePrompt implements Prompt {
    private readonly _editorWidth: number = 120;
    private readonly _editorHeight: number = 26;
    private readonly _fadeCurve: SVGPathElement = SVG.path({ fill: ColorConfig.uiWidgetBackground, "pointer-events": "none" });
    private readonly _dottedLinePath: SVGPathElement = SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 1, "stroke-dasharray": "3, 2", "pointer-events": "none" });
    private readonly _controlCurve: SVGPathElement = SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 2, "pointer-events": "none" });
    private readonly _svg: SVGSVGElement = SVG.svg({ style: `background-color: ${ColorConfig.editorBackground}; touch-action: none; cursor: crosshair;`, width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" },
        this._fadeCurve,
        this._dottedLinePath,
        this._controlCurve,
    );
    public readonly container: HTMLDivElement;

    private readonly _attackInput: HTMLInputElement = HTML.input({ type: "number", min: "0", max: Config.fadeInRange - 1, value: "0", class: "adsrInput" });
    private readonly _decayInput: HTMLInputElement = HTML.input({ type: "number", min: "0", max: Config.fadeOutTicks.length - 1, value: "0", class: "adsrInput" });
    private readonly _sustainInput: HTMLInputElement = HTML.input({ type: "number", min: "0", max: "100", value: "100", class: "adsrInput" });
    private readonly _releaseInput: HTMLInputElement = HTML.input({ type: "number", min: "0", max: Config.fadeOutTicks.length - 1, value: "0", class: "adsrInput" });

    private readonly _cancelButton: HTMLButtonElement = button({ class: "cancelButton" });

    constructor(private _doc: SongDocument) {
        const dottedLineX: number = this._fadeOutToX(Config.fadeOutNeutral);
        this._dottedLinePath.setAttribute("d", `M ${dottedLineX} 0 L ${dottedLineX} ${this._editorHeight}`);

        this.container = div({ class: "prompt", style: "width: 300px;" },
            h2("Fade In/Out Editor"),
            div({ class: "adsrInputs" },
                p("Attack: "), this._attackInput,
                p("Decay: "), this._decayInput,
                p("Sustain: "), this._sustainInput,
                p("Release: "), this._releaseInput,
            ),
            this._svg,
            this._cancelButton,
        );

        this._attackInput.addEventListener("input", this._updateGraph);
        this._decayInput.addEventListener("input", this._updateGraph);
        this._sustainInput.addEventListener("input", this._updateGraph);
        this._releaseInput.addEventListener("input", this._updateGraph);

        this._cancelButton.addEventListener("click", this._close);
    }

    private _fadeInToX(fadeIn: number) {
        return 1.0 + (this._editorWidth - 2.0) * 0.4 * fadeIn / (Config.fadeInRange - 1);
    }
   /* private _xToFadeIn(x: number) {
        return clamp(0, Config.fadeInRange, Math.round((x - 1.0) * (Config.fadeInRange - 1) / (0.4 * this._editorWidth - 2.0)));
    } */
    private _fadeOutToX(fadeOut: number) {
        return 1.0 + (this._editorWidth - 2.0) * (0.5 + 0.5 * fadeOut / (Config.fadeOutTicks.length - 1));
    }
    /*private _xToFadeOut(x: number) {
        return clamp(0, Config.fadeOutTicks.length, Math.round((Config.fadeOutTicks.length - 1) * ((x - 1.0) / (this._editorWidth - 2.0) - 0.5) / 0.5));
    } */

    private _updateGraph = (): void => {
        const attack = parseInt(this._attackInput.value) || 0;
        const decay = parseInt(this._decayInput.value) || 0;
        const sustain = parseInt(this._sustainInput.value) || 100;
        const release = parseInt(this._releaseInput.value) || 0;

        const fadeInX: number = this._fadeInToX(attack);
        const decayX: number = this._fadeOutToX(decay);
        const releaseX: number = this._fadeOutToX(release);

        let fadePath: string = "";
        fadePath += `M 0 ${this._editorHeight} `;
        fadePath += `L ${fadeInX} 0 `;
        fadePath += `L ${decayX} ${this._editorHeight * (1 - sustain / 100)} `;
        fadePath += `L ${releaseX} ${this._editorHeight} `;
        fadePath += "z";

        this._fadeCurve.setAttribute("d", fadePath);
    }

    private _close = (): void => {
        this._doc.undo();
    }
    public cleanUp = (): void => {
        this._cancelButton.removeEventListener("click", this._close);
    }

    public render(): void {
        this._updateGraph();
    }
}
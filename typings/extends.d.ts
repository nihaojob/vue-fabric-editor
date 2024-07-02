declare namespace fabric {
  export interface Canvas {
    contextTop: CanvasRenderingContext2D;
    lowerCanvasEl: HTMLElement;
    wrapperEl: HTMLElement;
    isDragging: boolean;
    historyProcessing: boolean;
    _currentTransform: unknown;
    extraProps: any;
    clearHistory(): void;
    _historyNext(): void;
    _historyInit(): void;
    offHistory(): void;
    _centerObject: (obj: fabric.Object, center: fabric.Point) => fabric.Canvas;
    _setupCurrentTransform(e: Event, target: fabric.Object, alreadySelected: boolean): void;
  }

  export interface Control {
    rotate: number;
  }

  export interface IObjectOptions {
    /**
     * 标识
     */
    id?: string | undefined;
  }

  export interface IUtil {
    findScaleToFit: (
      source: Record<string, unknown> | fabric.Object,
      destination: Record<string, unknown> | fabric.Object
    ) => number;
  }

  function ControlMouseEventHandler(
    eventData: MouseEvent,
    transformData: Transform,
    x: number,
    y: number
  ): boolean;
  function ControlStringHandler(
    eventData: MouseEvent,
    control: fabric.Control,
    fabricObject: fabric.Object
  ): string;
  export const controlsUtils: {
    rotationWithSnapping: ControlMouseEventHandler;
    scalingEqually: ControlMouseEventHandler;
    scalingYOrSkewingX: ControlMouseEventHandler;
    scalingXOrSkewingY: ControlMouseEventHandler;

    scaleCursorStyleHandler: ControlStringHandler;
    scaleSkewCursorStyleHandler: ControlStringHandler;
    scaleOrSkewActionName: ControlStringHandler;
    rotationStyleHandler: ControlStringHandler;
  };

  type EventNameExt = 'removed' | EventName;

  export interface IObservable<T> {
    on(
      eventName: 'guideline:moving' | 'guideline:mouseup',
      handler: (event: { e: Event; target: fabric.GuideLine }) => void
    ): T;
    on(events: { [key: EventName]: (event: { e: Event; target: fabric.GuideLine }) => void }): T;
  }

  export interface IGuideLineOptions extends ILineOptions {
    axis: 'horizontal' | 'vertical';
  }

  export interface IGuideLineClassOptions extends IGuideLineOptions {
    canvas: {
      setActiveObject(object: fabric.Object | fabric.GuideLine, e?: Event): Canvas;
      remove<T>(...object: (fabric.Object | fabric.GuideLine)[]): T;
    } & Canvas;
    activeOn: 'down' | 'up';
    initialize(xy: number, objObjects: IGuideLineOptions): void;
    callSuper(methodName: string, ...args: unknown[]): any;
    getBoundingRect(absolute?: boolean, calculate?: boolean): Rect;
    on(eventName: EventNameExt, handler: (e: IEvent<MouseEvent>) => void): void;
    off(eventName: EventNameExt, handler?: (e: IEvent<MouseEvent>) => void): void;
    fire<T>(eventName: EventNameExt, options?: any): T;
    isPointOnRuler(e: MouseEvent): 'horizontal' | 'vertical' | false;
    bringToFront(): fabric.Object;
    isHorizontal(): boolean;
  }

  export interface GuideLine extends Line, IGuideLineClassOptions {}

  export class GuideLine extends Line {
    constructor(xy: number, objObjects?: IGuideLineOptions);
    static fromObject(object: any, callback: any): void;
  }

  export interface StaticCanvas {
    ruler: InstanceType<typeof CanvasRuler>;
  }

  export class EraserBrush {
    constructor(canvas: Canvas);
  }

  export interface IRectOptions {
    [key: string]: unknown;
  }
}

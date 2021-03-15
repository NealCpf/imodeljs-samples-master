import {
  Tool,
  IModelApp,
  openImageDataUrlInNewWindow,
  Viewport,
} from "@bentley/imodeljs-frontend";

export function saveImage(vp: Viewport, min = 1200) {
  let canvas = vp.readImageToCanvas();

  const scale = canvas.width / canvas.height;

  const newCanvas = document.createElement("canvas");

  if (canvas.width > canvas.height) {
    newCanvas.height = min;
    newCanvas.width = min * scale;
  } else {
    newCanvas.height = min / scale;
    newCanvas.width = min;
  }

  newCanvas
    .getContext("2d")!
    .drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      newCanvas.width,
      newCanvas.height
    );

  canvas = newCanvas;

  

  return canvas.toDataURL("image/png");
}

export class SaveImageTool extends Tool {
  public static toolId = "ITwinWebApp.SaveImageTool";
  public static iconSpec = "icon-image";


  run(...args: any[]) {
    let vp: Viewport | undefined;

    if (args.length === 1) {
      vp = args[0];
    } else {
      vp = IModelApp.viewManager.selectedView;
    }

    if (vp === undefined) {
      return false;
    }

    const image = saveImage(vp);

    openImageDataUrlInNewWindow(image, "Saved Image");

    return true;
  }
}

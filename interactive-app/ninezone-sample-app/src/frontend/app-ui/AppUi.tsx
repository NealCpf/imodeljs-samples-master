/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { PresentationUnitSystem } from "@bentley/presentation-common";
import { PresentationManager } from "@bentley/presentation-frontend";
import { Presentation } from "@bentley/presentation-frontend/lib/presentation-frontend/Presentation";
import { BackstageManager, CommandItemDef, ConfigurableUiManager, FrontstageManager, SyncUiEventDispatcher, UiFramework } from "@bentley/ui-framework";
import { SaveImageTool } from "../tools/SaveImageTool";
import { SampleFrontstage } from "./frontstages/SampleFrontstage";
import { SampleFrontstage2 } from "./frontstages/SampleFrontstage2";

/**
 * Example Ui Configuration for an iModel.js App
 */
export class AppUi {

  // Initialize the ConfigurableUiManager
  public static async initialize() {
    // initialize UiFramework
    await UiFramework.initialize(undefined);

    let res = UiFramework.translate("keyinbrowser.label");
    console.log(res);

    // initialize Presentation
    await Presentation.initialize({ activeLocale: IModelApp.i18n.languageList()[1], activeUnitSystem: PresentationUnitSystem.Metric });

    ConfigurableUiManager.initialize();

    Presentation.selection.scopes.activeScope = "top-assembly";
  }

  // Command that toggles the backstage
  public static get backstageToggleCommand(): CommandItemDef {
    return BackstageManager.getBackstageToggleCommand();
  }

  /** Handle when an iModel and the views have been selected  */
  public static handleIModelViewsSelected(iModelConnection: IModelConnection, viewStates: ViewState[]): void {
    // Set the iModelConnection in the Redux store
    UiFramework.setIModelConnection(iModelConnection);
    UiFramework.setDefaultViewState(viewStates[0]);

    // Tell the SyncUiEventDispatcher about the iModelConnection
    SyncUiEventDispatcher.initializeConnectionEvents(iModelConnection);

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider = new SampleFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FrontstageManager.setActiveFrontstageDef(frontstageProvider.frontstageDef).then(() => {
      // Frontstage is ready
    });

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider2 = new SampleFrontstage2(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider2);

    // let presentatManager = Presentation.presentation;
    // presentatManager.activeUnitSystem = PresentationUnitSystem.Metric;
    // console.log(presentatManager.activeUnitSystem);

    IModelApp.quantityFormatter.setActiveUnitSystem(false, true);

    const toolNamespace = IModelApp.i18n.registerNamespace("SVTTools");
    IModelApp.tools.register(SaveImageTool, toolNamespace);

  }

}

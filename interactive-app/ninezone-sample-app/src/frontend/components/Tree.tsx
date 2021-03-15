/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./TreeWidget.css";
import { imageElementFromImageSource, IModelConnection } from "@bentley/imodeljs-frontend";
import { PresentationPropertyDataProvider, useControlledTreeFiltering, usePresentationTreeNodeLoader, useUnifiedSelectionTreeEventHandler } from "@bentley/presentation-components";
import { ControlledTree, FilteringInput, SelectionMode, useVisibleTreeNodes } from "@bentley/ui-components";
import * as React from "react";
import { useDisposable } from "@bentley/ui-core";
import { ContentViewManager } from "@bentley/ui-framework";
import { Id64, Id64Array, Id64String, Logger } from "@bentley/bentleyjs-core";
import { Console } from "console";
import { ElementProps } from "@bentley/imodeljs-common";
const RULESET_TREE = require("./Tree.ruleset.json"); // eslint-disable-line @typescript-eslint/no-var-requires

/** React properties for the tree component */
export interface Props {
  /** iModel whose contents should be displayed in the tree */
  imodel: IModelConnection;
}


async function getSelectedElementUserLable(imodel: IModelConnection | undefined): Promise<string | undefined> {
  const canidates: Id64Array = [];
  imodel?.selectionSet.elements.forEach((val) => { canidates.push(val); });
  if (canidates.length === 1) {
    const stringId = canidates[0];
    let elepropety = await imodel?.elements.getProps(stringId);
    if (elepropety === undefined) {
      return undefined;
    }
    return stringId;
  }

  return undefined;
}



/** Tree component for the viewer app */
export default function SimpleTreeComponent(props: Props) {

  // eslint-disable-line @typescript-eslint/naming-convention
  const nodeLoader = usePresentationTreeNodeLoader({ imodel: props.imodel, ruleset: RULESET_TREE, pagingSize: 30 });
  const [filter, setFilter] = React.useState("");
  const [activeMatchIndex, setActiveMatchIndex] = React.useState(0);

  const {
    filteredModelSource,
    filteredNodeLoader,
    isFiltering,
    matchesCount,
    nodeHighlightingProps,
  } = useControlledTreeFiltering({ nodeLoader, filter, activeMatchIndex });

  const eventHandler = useUnifiedSelectionTreeEventHandler({ nodeLoader: filteredNodeLoader ?? nodeLoader, collapsedChildrenDisposalEnabled: true, name: "TreeWithHooks" });
  const visibleNodes = useVisibleTreeNodes(filteredModelSource);

  const overlay = isFiltering ? <div className="filteredTreeOverlay" /> : null;

  return (
    < >
      <div>
        <h3>{"BRCM Cable Tree"}</h3>
        <FilteringInput
          filteringInProgress={isFiltering}
          onFilterCancel={() => { setFilter(""); }}
          onFilterClear={() => { setFilter(""); }}
          onFilterStart={(newFilter) => { setFilter(newFilter); }}
          resultSelectorProps={{
            onSelectedChanged: (index) => setActiveMatchIndex(index),
            resultCount: matchesCount || 0,
          }} />
      </div>
      <div className="filteredTree">
        <ControlledTree
          visibleNodes={visibleNodes}
          treeEvents={eventHandler}
          nodeLoader={filteredNodeLoader}
          selectionMode={SelectionMode.Extended}
          nodeHighlightingProps={nodeHighlightingProps}
          iconsEnabled={true}
        />
        {overlay}
      </div>
    </>
  );
}

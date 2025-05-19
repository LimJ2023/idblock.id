import {
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  $isTextNode,
} from "lexical";

import type { EditorState, ElementNode } from "lexical";

const $isWhitespace = (node: ElementNode) => {
  for (const child of node.getChildren()) {
    if (
      ($isElementNode(child) && !$isWhitespace(child)) ||
      ($isTextNode(child) && child.getTextContent().trim() !== "") ||
      $isDecoratorNode(child) // decorator nodes are arbitrary
    ) {
      return false;
    }
  }
  return true;
};

const $isEmpty = (editorState: EditorState) => {
  return editorState.read(() => {
    const root = $getRoot();
    const child = root.getFirstChild();

    if (
      child == null ||
      ($isElementNode(child) && child.isEmpty() && root.getChildrenSize() === 1)
    ) {
      return true;
    }

    return $isWhitespace(root);
  });
};

export { $isEmpty };

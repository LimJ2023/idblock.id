import {
  $applyNodeReplacement,
  $getSelection,
  $isNodeSelection,
} from "lexical";

import { CAN_USE_DOM } from "@lexical/utils";

import { ImageNode } from "@/components/editor/plugins/image/node";

import type { DOMConversionOutput, LexicalNode } from "lexical";

import type { ImagePayload } from "@/components/editor/plugins/image/node";

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

const $createImageNode = ({
  src,
  altText,
  width,
  height,
  maxWidth = 640,
  key,
}: ImagePayload): ImageNode =>
  $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, key),
  );

const $convertImageElement = (domNode: Node): null | DOMConversionOutput => {
  const img = domNode as HTMLImageElement;

  if (img.src.startsWith("file:///")) {
    return null;
  }
  const { alt: altText, src, width, height } = img;

  return { node: $createImageNode({ src, altText, width, height }) };
};

const $isImageNode = (
  node: LexicalNode | null | undefined,
): node is ImageNode => node instanceof ImageNode;

const $getImageNodeInSelection = (): ImageNode | null => {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
};

export {
  $convertImageElement,
  $createImageNode,
  $getImageNodeInSelection,
  $isImageNode,
  getDOMSelection,
};

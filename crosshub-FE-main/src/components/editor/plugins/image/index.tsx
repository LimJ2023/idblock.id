import { useEffect } from "react";

import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";

import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  INSERT_IMAGE_COMMAND,
  SWITCH_IMAGES_COMMAND,
  SwitchImageData,
} from "@/components/editor/plugins/image/constants";
import { ImageNode } from "@/components/editor/plugins/image/node";
import { $createImageNode } from "@/components/editor/plugins/image/utils";

import type { InsertImagePayload } from "@/components/editor/plugins/image/node";

const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagePlugin: ImageNode is not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);

          $insertNodes([imageNode]);

          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<SwitchImageData[]>(
        SWITCH_IMAGES_COMMAND,
        (payload) => {
          payload.forEach(({ node, storageSrc }) => {
            node.setSrc(storageSrc);
          });

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      // TODO: DragEvent
    );
  }, [editor]);

  return null;
};

export { ImageNode, ImagePlugin };

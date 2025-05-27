const BLOCK_TYPE_TO_BLOCK_NAME = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  paragraph: "Normal",
  quote: "Quote",
  code: "Code block",
  bullet: "Bullet list",
  number: "Number list",
  check: "Check list",
} as const;

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const MIN_ALLOWED_FONT_SIZE = 12;
const MAX_ALLOWED_FONT_SIZE = 48;
const DEFAULT_FONT_SIZE = 16;

export {
  BLOCK_TYPE_TO_BLOCK_NAME,
  DEFAULT_FONT_SIZE,
  FONT_FAMILY_OPTIONS,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
};

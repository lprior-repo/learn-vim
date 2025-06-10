export type CategoryData = {
  id: string;
  title: string;
  description: string;
  commands: CommandData[];
};

export type CommandData = {
  id: string;
  key: string;
  title: string;
  description: string;
};

export const VIM_CATEGORIES: CategoryData[] = [
  {
    id: "basic-movement",
    title: "Basic Movement",
    description: "Learn how to navigate in Vim",
    commands: [
      { id: "hjkl", key: "h j k l", title: "Basic Cursor Movement", description: "Move cursor left, down, up, right" },
      { id: "wb", key: "w b", title: "Word Movement", description: "Move cursor to next/previous word" },
      { id: "e", key: "e", title: "End of Word", description: "Move to the end of the word" },
      { id: "zero-dollar", key: "0 $", title: "Start/End of Line", description: "Move to start or end of the line" },
    ],
  },
  {
    id: "mode-switching",
    title: "Mode Switching",
    description: "Learn about Vim modes and how to switch between them",
    commands: [
      { id: "insert-mode", key: "i I a A", title: "Insert Mode", description: "Enter insert mode at different positions" },
      { id: "normal-mode", key: "Esc", title: "Normal Mode", description: "Return to normal mode" },
      { id: "visual-mode", key: "v V Ctrl+v", title: "Visual Mode", description: "Enter different visual modes" },
      { id: "command-mode", key: ":", title: "Command Mode", description: "Enter command mode" },
    ],
  },
  // ... rest of the categories remain the same
];

export const findCategory = (categoryId: string): CategoryData | undefined => {
  return VIM_CATEGORIES.find((cat) => cat.id === categoryId);
};

export const findCommand = (categoryId: string, commandId: string): CommandData | undefined => {
  const category = findCategory(categoryId);
  return category?.commands.find((cmd) => cmd.id === commandId);
};

export const getRelatedCategories = (currentCategoryId: string, limit: number = 3): CategoryData[] => {
  return VIM_CATEGORIES.filter((cat) => cat.id !== currentCategoryId).slice(0, limit);
};

export const getRelatedCommands = (categoryId: string, currentCommandId: string, limit: number = 3): CommandData[] => {
  const category = findCategory(categoryId);
  return category?.commands.filter((cmd) => cmd.id !== currentCommandId).slice(0, limit) ?? [];
};

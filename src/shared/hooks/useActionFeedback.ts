import { App } from "antd";

export function useActionFeedback() {
  const { message } = App.useApp();
  return {
    error: (description: string) => { void message.error(description); },
  };
}

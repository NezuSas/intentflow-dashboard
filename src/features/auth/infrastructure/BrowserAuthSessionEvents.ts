import type {
  AuthSessionEvents,
} from "../domain/AuthSessionEvents";

export class BrowserAuthSessionEvents
  implements AuthSessionEvents
{
  notifyLogout(): void {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.dispatchEvent(
      new Event(
        "intentflow:logout"
      )
    );
  }
}

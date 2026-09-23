import { describe, expect, it } from "vitest";
import { Button, Modal, Pagination } from "@/shared/components";

describe("shared UI primitives", () => {
  it("renders a disabled loading button with its requested loading label", () => {
    const element = Button({ variant: "primary", loading: true, loadingLabel: "Saving...", children: "Save" });

    expect(element.props.disabled).toBe(true);
    expect(element.props.children).toBe("Saving...");
  });

  it("does not render a closed modal", () => {
    expect(Modal({ open: false, title: "Details", onClose: () => undefined, children: "Content" })).toBeNull();
  });

  it("exposes pagination navigation as a single accessible primitive", () => {
    const element = Pagination({ page: 2, totalPages: 3, totalCount: 45, hasNext: true, hasPrevious: true, onNext: () => undefined, onPrevious: () => undefined });

    expect(element.props["aria-label"]).toBe("Pagination");
  });
});

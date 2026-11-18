import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { products } from "@/data/products";
import { ProductReplacement } from "./ProductReplacement";

const alts = products.filter((p) => p.category === "shoes").slice(0, 3);

describe("ProductReplacement", () => {
  it("opens as a modal dialog with focus inside", () => {
    render(<ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /shoes/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("lists alternatives with image, name and price", () => {
    render(<ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={() => {}} />);
    for (const p of alts) {
      expect(screen.getByRole("img", { name: new RegExp(p.name, "i") })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: new RegExp(`select ${p.name}`, "i") })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/zł/).length).toBe(alts.length);
  });

  it("calls onSelect with the chosen product", async () => {
    const onSelect = vi.fn();
    render(<ProductReplacement slot="shoes" alternatives={alts} onSelect={onSelect} onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`select ${alts[1].name}`, "i") }));
    expect(onSelect).toHaveBeenCalledWith(alts[1]);
  });

  it("closes on Escape and via the close button", async () => {
    const onClose = vi.fn();
    render(<ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps focus inside when tabbing", async () => {
    render(<ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 3; i++) {
      await userEvent.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("returns focus to the trigger on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(
      <ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={() => {}} />,
    );
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("shows a friendly message when there are no alternatives", () => {
    render(<ProductReplacement slot="shoes" alternatives={[]} onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText(/no other/i)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { baseElement } = render(
      <ProductReplacement slot="shoes" alternatives={alts} onSelect={() => {}} onClose={() => {}} />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});

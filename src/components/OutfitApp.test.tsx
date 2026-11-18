import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { products } from "@/data/products";
import { seeded } from "@/test/rng";
import { OutfitApp } from "./OutfitApp";

const create = () => screen.getByRole("button", { name: /create my outfit/i });

async function pickAll() {
  await userEvent.click(screen.getByRole("radio", { name: /running/i }));
  await userEvent.click(screen.getByRole("radio", { name: /mild/i }));
  await userEvent.click(screen.getByRole("radio", { name: /performance/i }));
}

const names = () =>
  screen
    .getAllByRole("button", { name: /change item/i })
    .map((b) => b.getAttribute("aria-label"));

describe("OutfitApp", () => {
  it("disables Create My Outfit until all three selections are made", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    expect(create()).toBeDisabled();
    expect(screen.getByText(/choose an activity, weather and style/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /running/i }));
    expect(create()).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /mild/i }));
    expect(create()).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /performance/i }));
    expect(create()).toBeEnabled();
  });

  it("allows changing selections before generating", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await userEvent.click(screen.getByRole("radio", { name: /running/i }));
    await userEvent.click(screen.getByRole("radio", { name: /gym/i }));
    expect(screen.getByRole("radio", { name: /gym/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /running/i })).toHaveAttribute("aria-checked", "false");
  });

  it("shows loading feedback, then the outfit", async () => {
    render(<OutfitApp loadingMs={30} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    expect(screen.getByRole("status")).toHaveTextContent(/creating your outfit/i);
    expect(await screen.findByRole("heading", { name: /your outfit is ready/i })).toBeInTheDocument();
  });

  it("replaces one item without changing the others and updates the total", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    const before = names();
    const totalBefore = screen.getByTestId("outfit-total").textContent;

    await userEvent.click(screen.getAllByRole("button", { name: /change item/i })[0]);
    const dialog = screen.getByRole("dialog");
    const choice = within(dialog).getAllByRole("button", { name: /^select /i })[0];
    const chosenName = choice.getAttribute("aria-label")!.replace(/^select /i, "");
    await userEvent.click(choice);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const after = names();
    expect(after[0]).toContain(chosenName);
    expect(after.slice(1)).toEqual(before.slice(1));
    expect(screen.getByTestId("outfit-total").textContent).not.toBe(totalBefore);
    expect(screen.getAllByRole("button", { name: /change item/i })[0]).toHaveFocus();
  });

  it("closes the replacement dialog with Escape without changing anything", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    const before = names();
    await userEvent.click(screen.getAllByRole("button", { name: /change item/i })[0]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(names()).toEqual(before);
  });

  it("generates another look with the same preferences", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(5)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    const before = names();
    await userEvent.click(screen.getByRole("button", { name: /generate another look/i }));
    expect(names()).not.toEqual(before);
    expect(screen.getByRole("region", { name: /outfit summary/i })).toHaveTextContent(/running/i);
  });

  it("goes back to preferences and keeps the selections", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    await userEvent.click(screen.getByRole("button", { name: /back to preferences/i }));
    expect(screen.getByRole("radio", { name: /running/i })).toHaveAttribute("aria-checked", "true");
    expect(create()).toBeEnabled();
  });

  it("shows a friendly error when the catalogue cannot build an outfit", async () => {
    render(<OutfitApp catalogue={[]} loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't build a complete outfit/i);
  });

  it("uses the real catalogue by default", async () => {
    render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    const shown = screen.getAllByRole("button", { name: /change item/i }).length;
    expect(shown).toBeGreaterThanOrEqual(3);
    expect(products.length).toBeGreaterThan(shown);
  });

  it("has no accessibility violations on the config screen", async () => {
    const { container } = render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations on the outfit screen", async () => {
    const { container } = render(<OutfitApp loadingMs={0} rng={seeded(1)} />);
    await pickAll();
    await userEvent.click(create());
    await screen.findByRole("heading", { name: /your outfit is ready/i });
    expect(await axe(container)).toHaveNoViolations();
  });
});

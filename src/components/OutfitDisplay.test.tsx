import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { products } from "@/data/products";
import { calculateTotal, generateOutfit } from "@/lib/outfitGenerator";
import { formatPLN } from "@/lib/format";
import { seeded } from "@/test/rng";
import { OutfitDisplay } from "./OutfitDisplay";

const outfit = generateOutfit(
  { activity: "football", weather: "rainy", style: "bold" },
  products,
  { rng: seeded(2) },
);

const setup = (over = {}) => {
  const props = {
    outfit,
    explanation: "Because reasons.",
    notice: null,
    onChangeItem: vi.fn(),
    onRegenerate: vi.fn(),
    onBack: vi.fn(),
    ...over,
  };
  render(<OutfitDisplay {...props} />);
  return props;
};

describe("OutfitDisplay", () => {
  it("shows the heading and explanation", () => {
    setup();
    expect(screen.getByRole("heading", { name: /your outfit is ready!/i })).toBeInTheDocument();
    expect(screen.getByText("Because reasons.")).toBeInTheDocument();
  });

  it("shows one card per item", () => {
    setup();
    for (const i of outfit.items) {
      expect(screen.getByText(i.product.name)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /change item/i })).toHaveLength(outfit.items.length);
  });

  it("summarises activity, weather and style", () => {
    setup();
    const summary = screen.getByRole("region", { name: /outfit summary/i });
    expect(summary).toHaveTextContent(/football/i);
    expect(summary).toHaveTextContent(/wet & rainy/i);
    expect(summary).toHaveTextContent(/bold/i);
  });

  it("shows the total equal to the sum of items", () => {
    setup();
    const sum = outfit.items.reduce((s, i) => s + i.product.priceMinor, 0);
    expect(sum).toBe(calculateTotal(outfit));
    expect(screen.getByTestId("outfit-total")).toHaveTextContent(formatPLN(sum).replace(/\s/g, " ").replace(/ /g, " "));
  });

  it("fires the item, regenerate and back callbacks", async () => {
    const props = setup();
    await userEvent.click(screen.getAllByRole("button", { name: /change item/i })[0]);
    expect(props.onChangeItem).toHaveBeenCalledWith(outfit.items[0].slot);
    await userEvent.click(screen.getByRole("button", { name: /generate another look/i }));
    expect(props.onRegenerate).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /back to preferences/i }));
    expect(props.onBack).toHaveBeenCalled();
  });

  it("shows a notice when provided", () => {
    setup({ notice: "No other look available." });
    expect(screen.getByRole("status")).toHaveTextContent("No other look available.");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OutfitDisplay
        outfit={outfit}
        explanation="x"
        notice={null}
        onChangeItem={() => {}}
        onRegenerate={() => {}}
        onBack={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

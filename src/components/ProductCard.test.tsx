import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";

const product = products.find((p) => p.id === "pulse-runner")!;

describe("ProductCard", () => {
  it("shows image, name, category, colour and price", () => {
    render(<ProductCard slot="shoes" product={product} onChange={() => {}} />);
    expect(screen.getByRole("img", { name: /pulse runner/i })).toBeInTheDocument();
    expect(screen.getByText("Pulse Runner")).toBeInTheDocument();
    expect(screen.getByText(/shoes/i)).toBeInTheDocument();
    expect(screen.getByText(/black/i)).toBeInTheDocument();
    expect(screen.getByText(/529,99/)).toBeInTheDocument();
  });

  it("has a Change item button naming the product", async () => {
    const onChange = vi.fn();
    render(<ProductCard slot="shoes" product={product} onChange={onChange} />);
    const btn = screen.getByRole("button", { name: /change item.*pulse runner/i });
    await userEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith("shoes");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ProductCard slot="shoes" product={product} onChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

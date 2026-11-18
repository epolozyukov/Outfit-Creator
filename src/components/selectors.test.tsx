import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ActivitySelector } from "./ActivitySelector";
import { StyleSelector } from "./StyleSelector";
import { WeatherSelector } from "./WeatherSelector";

const cases = [
  {
    name: "ActivitySelector",
    group: /activity/i,
    Component: ActivitySelector,
    options: [
      ["Running", "running"],
      ["Gym", "gym"],
      ["Football", "football"],
      ["Casual", "casual"],
    ],
  },
  {
    name: "WeatherSelector",
    group: /weather/i,
    Component: WeatherSelector,
    options: [
      ["Hot & sunny", "hot"],
      ["Mild & dry", "mild"],
      ["Cold & dry", "cold"],
      ["Wet & rainy", "rainy"],
    ],
  },
  {
    name: "StyleSelector",
    group: /style/i,
    Component: StyleSelector,
    options: [
      ["Performance", "performance"],
      ["Minimal", "minimal"],
      ["Bold", "bold"],
      ["Streetwear", "streetwear"],
    ],
  },
] as const;

describe.each(cases)("$name", ({ group, Component, options }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C = Component as any;

  it("renders a radiogroup with four options", () => {
    render(<C value={undefined} onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: group })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it.each(options.map((o) => [...o] as [string, string]))(
    "selecting %s fires onChange(%s)",
    async (label, value) => {
    const onChange = vi.fn();
    render(<C value={undefined} onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("radio", { name: new RegExp(label, "i") }),
    );
    expect(onChange).toHaveBeenCalledWith(value);
    },
  );

  it("exposes the selected state via aria-checked", () => {
    render(<C value={options[1][1]} onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
      "false",
    ]);
  });

  it("supports arrow-key navigation", async () => {
    const onChange = vi.fn();
    render(<C value={options[0][1]} onChange={onChange} />);
    screen.getAllByRole("radio")[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(options[1][1]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(options[3][1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith(options[1][1]);
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenLastCalledWith(options[3][1]);
  });

  it("ignores unrelated keys", async () => {
    const onChange = vi.fn();
    render(<C value={options[0][1]} onChange={onChange} />);
    screen.getAllByRole("radio")[0].focus();
    await userEvent.keyboard("a");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is reachable by keyboard when nothing is selected", async () => {
    render(<C value={undefined} onChange={() => {}} />);
    await userEvent.tab();
    expect(screen.getAllByRole("radio")[0]).toHaveFocus();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<C value={options[0][1]} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

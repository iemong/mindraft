import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import Button from "./Button";

test("renders name", async () => {
	const { getByRole } = render(<Button />);

	await expect
		.element(getByRole("button", { name: "Click me" }))
		.toBeInTheDocument();
});

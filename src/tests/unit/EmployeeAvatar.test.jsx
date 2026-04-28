import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmployeeAvatar from "../../Components/Atoms/EmployeeAvatar";

vi.stubEnv("VITE_API_URL", "http://localhost:3000");

describe("EmployeeAvatar Component", () => {
    const mockFullName = "John Doe";
    const mockPicture = "avatars/john.png";

    it('debe renderizar la imagen correctamente cuando se proporciona "picture"', () => {
        render(
            <EmployeeAvatar picture={mockPicture} fullName={mockFullName} />,
        );

        const img = screen.getByRole("img");

        expect(img).toHaveAttribute(
            "src",
            "http://localhost:3000/avatars/john.png",
        );
        expect(img).toHaveAttribute("alt", mockFullName);
    });

    it('debe mostrar el icono SVG de fallback cuando "picture" es null o undefined', () => {
        const { container } = render(
            <EmployeeAvatar picture={null} fullName={mockFullName} />,
        );

        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();

        const img = screen.queryByRole("img");
        expect(img).not.toBeInTheDocument();
    });

    it("debe aplicar las clases CSS personalizadas pasadas por props", () => {
        const customClass = "w-20 h-20";
        const { container } = render(
            <EmployeeAvatar
                picture={null}
                fullName={mockFullName}
                className={customClass}
            />,
        );

        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("w-20 h-20");
        expect(wrapper).toHaveClass("rounded-full");
    });
});

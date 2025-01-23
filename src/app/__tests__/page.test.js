import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAtom } from "jotai";
import Home from "../page"; // Update with the correct path
import axios from "axios";

// Mock modules
jest.mock("axios");
jest.mock("jotai", () => ({
    useAtom: jest.fn(),
}));

describe("Home Component", () => {
    const queryClient = new QueryClient();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders loading state", () => {
        useAtom.mockReturnValue(["", jest.fn()]); // Mock atoms
        axios.get.mockResolvedValueOnce({}); // Mock axios response

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        );

        expect(container).toHaveTextContent("Loading...");
    });

    it("renders error state", async () => {
        useAtom.mockReturnValue(["testCity", jest.fn()]); // Mock atoms
        axios.get.mockRejectedValueOnce(new Error("Network error")); // Mock error

        render(
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    it("renders weather data", async () => {
        const mockData = {
            data: {
                city: { name: "Test City", sunrise: 1702517657, sunset: 1702518657 },
                list: [
                    {
                        dt: 1702528657,
                        main: {
                            temp: 300,
                            feels_like: 298,
                            temp_min: 295,
                            temp_max: 305,
                            pressure: 1012,
                            humidity: 60,
                        },
                        weather: [
                            {
                                description: "Clear sky",
                                icon: "01d",
                            },
                        ],
                        visibility: 10000,
                        wind: { speed: 2 },
                        dt_txt: "2024-01-22 12:00:00",
                    },
                ],
            },
        };

        useAtom.mockReturnValue(["testCity", jest.fn()]); // Mock atoms
        axios.get.mockResolvedValueOnce(mockData); // Mock API response

        render(
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Test City")).toBeInTheDocument();
            expect(screen.getByText("Clear sky")).toBeInTheDocument();
            expect(screen.getByText("27°")).toBeInTheDocument(); // Example for converted Kelvin to Celsius
        });
    });
});

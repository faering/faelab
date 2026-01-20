import { useState, useEffect } from "react";

export default function useDarkSide() {
    const [theme, setTheme] = useState(() => localStorage.theme || "light");

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    return [theme, setTheme];
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0; // Random number between 0 and 15
            const v = c === "x" ? r : (r & 0x3) | 0x8; // Ensure proper version (4) and variant (RFC4122)
            return v.toString(16);
        }
    );
}

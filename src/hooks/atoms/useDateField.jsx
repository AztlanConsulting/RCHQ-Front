import { useEffect } from "react";

export const useDateField = () => {
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                const headerContainer = document.querySelector(
                    '[class*="mb-2"][class*="flex"][class*="justify-between"]',
                );

                if (!headerContainer) return;

                const headerText = headerContainer.textContent
                    .trim()
                    .toLowerCase();

                const monthNames = {
                    enero: 1,
                    febrero: 2,
                    marzo: 3,
                    abril: 4,
                    mayo: 5,
                    junio: 6,
                    julio: 7,
                    agosto: 8,
                    septiembre: 9,
                    octubre: 10,
                    noviembre: 11,
                    diciembre: 12,
                };

                let displayedMonth = null;
                let displayedYear = null;

                for (const [monthName, monthNum] of Object.entries(
                    monthNames,
                )) {
                    if (headerText.includes(monthName)) {
                        displayedMonth = monthNum;
                        break;
                    }
                }

                const yearMatch = headerText.match(/\d{4}/);
                if (yearMatch) {
                    displayedYear = parseInt(yearMatch[0]);
                }

                if (!displayedMonth || !displayedYear) return;

                const daysInMonth = new Date(
                    displayedYear,
                    displayedMonth,
                    0,
                ).getDate();

                let allButtons = document.querySelectorAll(
                    'button[type="button"]',
                );

                let dayButtons = [];
                allButtons.forEach((button) => {
                    const text = button.textContent.trim();
                    if (/^\d+$/.test(text)) {
                        dayButtons.push({ button, dayNum: parseInt(text) });
                    }
                });

                if (dayButtons.length === 0) return;

                let monthStartIndex = -1;

                for (let i = 0; i <= dayButtons.length - daysInMonth; i++) {
                    let isValidSequence = true;

                    for (let day = 1; day <= daysInMonth; day++) {
                        if (
                            i + day - 1 >= dayButtons.length ||
                            dayButtons[i + day - 1].dayNum !== day
                        ) {
                            isValidSequence = false;
                            break;
                        }
                    }

                    if (isValidSequence) {
                        monthStartIndex = i;
                        break;
                    }
                }

                if (monthStartIndex === -1) return;

                const monthEndIndex = monthStartIndex + daysInMonth - 1;

                dayButtons.forEach(({ button, dayNum }, index) => {
                    if (button.classList.contains("bg-primary-700")) {
                        button.classList.remove("outside-month-day");
                        return;
                    }

                    if (index >= monthStartIndex && index <= monthEndIndex) {
                        button.classList.remove("outside-month-day");
                    } else {
                        button.classList.add("outside-month-day");
                    }
                });
            }, 50);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);
};

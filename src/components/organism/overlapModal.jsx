import Button from "../atoms/button";

const OverlapModal = ({
    isOpen,
    collisions = [],
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const formatDateTime = (iso) => {
        try {
            return new Date(iso).toLocaleString("es-MX", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
            });
        } catch {
            return iso;
        }
    };

    const overlapMessage =
        collisions.length === 1
            ? `Estás a punto de registrar un evento que se empalma con “${collisions[0]?.name ?? "otro evento"}”`
            : `Estás a punto de registrar un evento que se empalma con ${collisions.length} eventos`;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="overlap-title"
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 p-4"
        >
            <div className="flex w-full max-w-[380px] flex-col gap-5 rounded-2xl bg-white px-5 py-5 shadow-[0_10px_32px_rgba(0,0,0,0.18)] sm:px-7">
                <h2
                    id="overlap-title"
                    className="text-base font-bold leading-tight text-[#121212]"
                >
                    {overlapMessage}
                </h2>

                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                    {collisions.map((collision, index) => (
                        <div
                            key={collision.houseEventId ?? index}
                            className="flex flex-col gap-0.5"
                        >
                            <span className="text-sm font-semibold leading-tight text-[#121212]">
                                {collision.name}
                            </span>
                            <span className="text-xs font-medium leading-tight text-[#6b7280]">
                                {formatDateTime(collision.start)} -{" "}
                                {formatDateTime(collision.end)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <Button
                        text={isLoading ? "Registrando..." : "Confirmar"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        width="w-full sm:w-[146px]"
                        height="h-[41px]"
                        textSize="text-sm"
                        fontWeight="font-bold"
                        bgColor="bg-white"
                        textColor="text-[#121212]"
                        hoverColor="hover:bg-neutral-50"
                        activeColor="active:bg-neutral-100"
                        className="border border-[#e5e7eb] px-4 shadow-[0_1px_5px_rgba(0,0,0,0.25)]"
                    />
                    <Button
                        text="Cancelar"
                        onClick={onCancel}
                        disabled={isLoading}
                        width="w-full sm:w-[146px]"
                        height="h-[41px]"
                        textSize="text-sm"
                        fontWeight="font-bold"
                        bgColor="bg-[#1E3A5F]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#162d4a]"
                        activeColor="active:bg-[#0f1f33]"
                        className="px-4 shadow-[0_1px_4px_rgba(0,0,0,0.22)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default OverlapModal;

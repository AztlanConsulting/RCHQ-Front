import { useLayoutEffect, useRef, useState } from "react";
import { getStartHour } from "@/utils/dates";

const WeekTimeCard = ({ arg }) => {
  const ev = arg.event;
  const start = ev.start;
  const end = ev.end;
  const x = ev.extendedProps ?? {};
  const showAsAllDay = ev.allDay;
  const subtitle = String(x.subtitle ?? "").trim();
  const description = String(x.description ?? "").trim();

  let timeLine = "";
  if (!showAsAllDay && start != null && end != null) {
    const a = getStartHour(start);
    const b = getStartHour(end);
    if (a && b) timeLine = `${a} – ${b}`;
  }

  const cardRef = useRef(null);
  const fixedRef = useRef(null);
  const measureRef = useRef(null);
  const [showDescription, setShowDescription] = useState(false);

  useLayoutEffect(() => {
    if (!description || showAsAllDay) {
      setShowDescription(false);
      return;
    }

    const card = cardRef.current;
    const fixed = fixedRef.current;
    const measureEl = measureRef.current;
    if (!card || !fixed || !measureEl) return;

    const compute = () => {
      const cs = getComputedStyle(card);
      const padX =
        parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const innerW = Math.max(0, card.clientWidth - padX);

      measureEl.style.width = `${innerW}px`;

      const descH = measureEl.offsetHeight;

      const gapParsed = parseFloat(cs.rowGap || cs.gap || "0");
      const gap = Number.isFinite(gapParsed) ? gapParsed : 0;

      const available = card.clientHeight - fixed.offsetHeight - gap;

      setShowDescription(innerW > 0 && available + 0.5 >= descH);
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(card);
    ro.observe(fixed);

    return () => ro.disconnect();
  }, [description, subtitle, ev.title, timeLine, showAsAllDay]);

  const titleClass = showAsAllDay
      ? "fc-weekTimeCard-title font-medium text-xs"
      : "fc-weekTimeCard-title font-medium text-sm";

  return (
    <div
      ref={cardRef}
      className={`fc-weekTimeCard${showAsAllDay ? " fc-weekTimeCard--allday" : ""}`}
      style={{
        backgroundColor: ev.backgroundColor,
        borderColor: ev.borderColor ?? ev.backgroundColor,
      }}
    >
      <div ref={fixedRef} className="fc-weekTimeCard-fixed">
        <div className="fc-weekTimeCard-titleRow">
          <span className={titleClass}>{ev.title}</span>
        </div>

        {timeLine ? (
          <span className="fc-weekTimeCard-meta block">{timeLine}</span>
        ) : null}

        {subtitle ? (
          <span className="fc-weekTimeCard-subtitle block">{subtitle}</span>
        ) : null}
      </div>

      {!showAsAllDay && description && showDescription ? (
        <div className="fc-weekTimeCard-description mt-3">{description}</div>
      ) : null}

      {!showAsAllDay && description ? (
        <div
          aria-hidden
          className="fc-weekTimeCard-measure-host"
          style={{
            position: "absolute",
            left: -99999,
            top: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <div ref={measureRef} className="fc-weekTimeCard-description">
            {description}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WeekTimeCard;

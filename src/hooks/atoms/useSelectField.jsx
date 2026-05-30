import { useEffect, useMemo, useRef, useState } from "react";

const useSelectField = ({
  id,
  name,
  value,
  setValue,
  onChange,
  options = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const fieldName = name || id;
  const labelId = `${id}-label`;

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value],
  );

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleValueChange = (nextValue) => {
    closeMenu();

    if (onChange) {
      onChange({
        target: {
          value: nextValue,
          name: fieldName,
        },
      });
      return;
    }

    if (setValue) {
      setValue(nextValue);
    }
  };

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleOutsideClick = (event) => {
      const target = event.target;
      if (
        triggerRef.current?.contains(target)
        || menuRef.current?.contains(target)
      ) {
        return;
      }

      closeMenu();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    menuStyle,
    triggerRef,
    menuRef,
    fieldName,
    labelId,
    selectedOption,
    handleValueChange,
  };
};

export default useSelectField;

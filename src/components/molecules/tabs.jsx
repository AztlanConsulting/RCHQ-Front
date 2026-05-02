import { createContext, useContext } from "react";
import Type from "../atoms/type";

const TabsContext = createContext({
  selectedKey: null,
  onSelectionChange: () => {},
});

const TabListContext = createContext({ type: "underline" });

const tabListStyles = {
  underline:
    "flex gap-3 relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-slate-200",
  "button-border":
    "flex gap-1 rounded-[10px] bg-slate-100 p-1 ring-1 ring-slate-200 ring-inset",
  "button-gray": "flex gap-1",
};

const TabList = ({ type = "underline", items, children, className }) => {
  const listClass = [tabListStyles[type] ?? tabListStyles.underline, className]
    .filter(Boolean)
    .join(" ");

  return (
    <TabListContext.Provider value={{ type }}>
      <div role="tablist" className={listClass}>
        {items ? items.map((item) => children(item)) : children}
      </div>
    </TabListContext.Provider>
  );
};

const tabItemStyles = {
  underline: {
    base: "relative z-10 whitespace-nowrap px-0.5 pb-2.5 pt-0 text-base sm:text-3xl font-normal tracking-tight border-b-2 transition duration-100 cursor-pointer",
    selected: "border-slate-800 text-slate-800",
    idle: "border-transparent text-slate-400 hover:text-slate-600",
  },
  "button-border": {
    base: "whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition duration-100 cursor-pointer",
    selected: "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200",
    idle: "text-slate-500 hover:text-slate-700",
  },
  "button-gray": {
    base: "whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition duration-100 cursor-pointer",
    selected: "bg-slate-100 text-slate-800",
    idle: "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
  },
};

const TabItem = ({ id, label }) => {
  const { selectedKey, onSelectionChange } = useContext(TabsContext);
  const { type } = useContext(TabListContext);
  const isSelected = selectedKey === id;
  const styles = tabItemStyles[type] ?? tabItemStyles.underline;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onSelectionChange(id)}
      className={[styles.base, isSelected ? styles.selected : styles.idle].join(
        " ",
      )}
    >
      <Type variant="display-name" as="span">
        {label}
      </Type>
    </button>
  );
};

const Tabs = ({ selectedKey, onSelectionChange, className, children }) => {
  return (
    <TabsContext.Provider value={{ selectedKey, onSelectionChange }}>
      <div
        className={["flex w-full flex-col", className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.List = TabList;
Tabs.Item = TabItem;

export { Tabs };

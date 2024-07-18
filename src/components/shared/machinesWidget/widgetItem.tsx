import { Link } from "react-router-dom";
import chevronRight from "./../../../images/chevron-right.svg"
import { ConditionalLink } from "../conditionalLink";

interface WidgetItemProps {
  title: string;
  amount: number;
  to?: string;
};

export const WidgetItem: React.FC<WidgetItemProps> = ({ title, amount, to }) => {
  const conditionalClasses = to ? "hover:bg-widgetHoverBg" : "";

  return (
    <ConditionalLink to={to}>
      <div className={`flex bg-widgetBg p-5 rounded-xl ${conditionalClasses}`}>
        <div className="flex flex-col gap-4">
          <div className="text-5xl font-semibold">{amount}</div>
          <div className="text-textSecondary text-sm font-normal">{title}</div>
        </div>
        {to &&
          <div className="flex ml-auto">
            <img src={chevronRight} alt="chevron right" />
          </div>
        }
      </div>
    </ConditionalLink>
  );
}

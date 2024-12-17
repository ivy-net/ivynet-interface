import AlertsIcon from "../images/alerts.svg"
import { ConditionalLink } from "./shared/conditionalLink";
import { GoBackButton } from "./shared/goBackButton"

interface TopbarProps {
  title?: string
  goBackTo?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, goBackTo }) => {
  return (
    <div className="flex items-center w-full gap-4">
      {title && <div className="text-2xl leading-7 font-semibold">{title}</div>}
      {goBackTo && <GoBackButton to={goBackTo} />}
      {/* <div className="rounded-full border-iconBorderColor p-2.5 border w-10 h-10 ml-auto">
        <img src={AlertsIcon} alt="Alert icon" />
      </div> */}

      <div className="ml-auto">
        <ConditionalLink to="">
          <div className="flex justify-center items-center rounded-full p-2.5 bg-[#7E7BF5]/[.15] w-10 h-10 text-accent font-medium text-base ml-auto">
I
          </div>
        </ConditionalLink>
      </div>
    </div>
  );
}

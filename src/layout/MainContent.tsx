import { Topbar } from "../components/Topbar"

interface MainContentProps {
  children: React.ReactNode
};

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <div className="flex w-full m-2.5">
      <div className="flex flex-col bg-contentBg w-full rounded-2xl py-9 px-10 gap-10">{children}</div>
    </div>
  );
}

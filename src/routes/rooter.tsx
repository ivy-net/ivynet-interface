import { App } from '../App';
import { AvsTab } from '../components/avsTab';
import { MachinesTab } from '../components/machinesTab';
import { OverviewTab } from '../components/overviewTab';
import { RewardsTab } from '../components/rewardsTab';
import { SettingsTab } from '../components/settingsTab';
import { HelpTab } from '../components/helpTab';
import {
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { Machine } from '../components/machinesTab/machine';
import { InstallClientModal } from '../components/machinesTab/InstallClientModal';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      {
        path: "",
        loader: () => {
          return redirect("/overview");
        },
      },
      {
        path: "overview",
        element: <OverviewTab />
      },
      {
        path: "nodes",
        element: <MachinesTab />,
        children: [
          {
            path: "",
          },
          {
            path: "install/client",
            element: <InstallClientModal />,
          }
        ]
      },
      {
        path: "nodes/:address",
        element: <Machine />
      },
      {
        path: "avs",
        element: <AvsTab />
      },
      {
        path: "rewards",
        element: <RewardsTab />
      },
      {
        path: "settings",
        element: <SettingsTab />
      },
      {
        path: "help",
        element: <HelpTab />
      },

    ]
  },
]);
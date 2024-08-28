import { App } from '../App';
import { AvsTab } from '../components/avsTab';
import { OverviewTab } from '../components/overviewTab';
import { RewardsTab } from '../components/rewardsTab';
import { SettingsTab } from '../components/settingsTab';
import { HelpTab } from '../components/helpTab';
import {
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { MachinesTab } from '../components/machinesTab';
import { InstallClientModal } from '../components/machinesTab/InstallClientModal';
import { UpdateClientModal } from '../components/machinesTab/UpdateClientModal';
import { AvsUpgradeModal } from '../components/machinesTab/AvsUpgradeModal';
import { AvsDeregisterModal } from '../components/machinesTab/AvsDeregisterModal';
import { Machine } from '../components/machinesTab/machine';
import { AvsModal } from '../components/avsTab/avs';
import { Login } from '../components/login';
import { Signup } from '../components/signup';
import { Welcome } from '../components/welcome';
import { OrgTab } from '../components/orgTab';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        loader: () => {
          return redirect("/nodes");
        },
      },
      // {
      //   path: "overview",
      //   element: <OverviewTab />
      // },
      {
        path: "nodes",
        element: <MachinesTab />,
        children: [
          {
            path: "",
            element: <></>
          },
          {
            path: "code/installclient",
            element: <InstallClientModal />,
          },
          {
            path: "code/updateclient",
            element: <UpdateClientModal />,
          },
          {
            path: "code/avsupgrade",
            element: <AvsUpgradeModal />,
          },
          {
            path: "code/avsderegister",
            element: <AvsDeregisterModal />,
          }
        ]
      },
      {
        path: "nodes/:address",
        element: <Machine />
      },
      {
        path: "avs",
        element: <AvsTab />,
        children: [
          {
            path: "",
          },
          {
            path: ":id",
            element: <AvsModal />
          }
        ]
      },
      {
        path: "organization",
        element: <OrgTab />
      },
      // {
      //   path: "rewards",
      //   element: <RewardsTab />
      // },
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
  {
    path: "login",
    element: <Login />
  },
  {
    path: "signup",
    element: <Signup />
  },
  {
    path: "welcome",
    element: <Welcome />
  },
]);
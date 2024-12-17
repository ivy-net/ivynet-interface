import { App } from '../App';
import { AvsTab } from '../components/avsTab';
import { SettingsTab } from '../components/settingsTab';
import { HelpTab } from '../components/helpTab';
import {createBrowserRouter, redirect, LoaderFunction} from "react-router-dom";
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
import OrgTab from '../components/orgTab';
import { AddUserModal } from '../components/settingsTab/AddUserModal';
import { ForgotPassword } from '../components/forgotPassword';
import { HelpModal } from '../components/HelpModal';
import { AddAVSModal } from '../components/machinesTab/AddAVSModal';
import { EditKeysModal } from '../components/machinesTab/EditKeysModal';
import { DeleteMachineModal } from '../components/machinesTab/DeleteMachineModal';
import { EditMachineModal } from '../components/machinesTab/EditMachineModal';
import { PasswordSet } from '../components/passwordset/index';
import { PasswordReset } from '../components/passwordreset/index';

const authLoader: LoaderFunction = ({ request }) => {
  // Skip auth check for public routes
  const publicPaths = ['/login', '/signup', '/reset', '/welcome', '/password_set', '/password_reset'];
   const url = new URL(request.url);
   if (publicPaths.some(path => url.pathname.startsWith(path))) {  // Using startsWith to handle parameters
     return null;
   }

   if (!localStorage.getItem("session_id")) {
     return redirect("/login");
   }
   return null;
 };


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // shouldRevalidate: () => true,
     loader: authLoader,
     //() => {
    //   if (!localStorage.getItem("session_id")) {
    //     return redirect("/login")
    //   }
    //   return null;
    // },
    children: [
      {
        path: "",
        loader: () => redirect("/machines"),
           },
      // {
      //   path: "overview",
      //   element: <OverviewTab />
      // },
      {
        path: "machines",
        element: <MachinesTab />,
        children: [
          {
            path: "",
            element: <></>
          },
          {
            path: "help",
            element: <HelpModal />
          },
          {
            path: "code",
            children: [
              {
                path: "installclient",
                element: <InstallClientModal />,
              },
              {
                path: "addavs",
                element: <AddAVSModal />,
              },
              {
                path: "updateclient",
                element: <UpdateClientModal />,
              },
              {
                path: "avsupgrade",
                element: <AvsUpgradeModal />,
              },
              {
                path: "avsderegister",
                element: <AvsDeregisterModal />,
              },
            ]
          },
          {
            path: "edit",
            children: [
              {
                path: "keys",
                element: <EditKeysModal />,
              },
              {
                path: ":avsName/:machineId",
                element: <EditMachineModal />,
              },
            ]
          },
          {
            path: "delete",
            children: [
              {
                path: ":avsName/:machineId",
                element: <DeleteMachineModal />,
              },
            ]
          },
          {
            path: "avs",
            children: [
              {
                path: ":avsName",
                element: <AvsModal />,
              },
            ]
          },
        ]
      },
      {
        path: "machines/:address",
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
          },
          {
            path: "help",
            element: <HelpModal />
          },
        ]
      },
      {
        path: "overview",
        element: <OrgTab />,
        children: [
          {
            path: "help",
            element: <HelpTab />
          },
        ]
      },
      // {
      //   path: "rewards",
      //   element: <RewardsTab />
      // },
      {
        path: "organization",
        element: <SettingsTab />,
        children: [
          {
            path: "adduser",
            element: <AddUserModal />
          },
          {
            path: "help",
            element: <HelpModal />
          },
        ]
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
    path: "reset",
    element: <ForgotPassword />
  },
  {
    path: "welcome",
    element: <Welcome />
  },
  // In your router configuration
{
  path: "password_reset/:token",  // Add this new route
  element: <PasswordReset />
},
  {
    path: "password_set/:token",  // Changed from setPassword/:token to match the URL format
    element: <PasswordSet />
  }
]);

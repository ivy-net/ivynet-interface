import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { Topbar } from "../Topbar";
import { User } from "./User";

interface SettingsTabProps {
};

export const SettingsTab: React.FC<SettingsTabProps> = ({ }) => {
  const options = [
    { label: "Resend Email", link: "" },
    { label: "Change Role", link: "" },
    { label: "Delete User", link: "" },
  ]
  const users = [{ name: "Name", email: "name@something.com", role: "Admin", lastOnline: "02/02/24" },
  { name: "Name", email: "name@something.com", role: "Admin", lastOnline: "02/02/24" },
  { name: "Name", email: "name@something.com", role: "Admin", lastOnline: "02/02/24" },
  { name: "Name", email: "name@something.com", role: "Admin", lastOnline: "02/02/24" },
  { name: "Name", email: "name@something.com", role: "Admin", lastOnline: "02/02/24" }]

  return (
    <>
      <div className="flex flex-col gap-10">
        <Topbar title="Organization" />
        <div className="flex flex-col gap-6">
          <User name="Diogo Ribeiro" desc="Cool Company Name" role="Owner" size="md" />
          <div className="flex items-center justify-between">
            <div className="text-textPrimary text-base leading-5 font-medium">All members</div>
            <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg">+ Add Member</button>
          </div>
          <Table>
            <Tr>
              <Th content="Name"></Th>
              <Th content="Role"></Th>
              <Th content="Last Online"></Th>
              <Th content=""></Th>
            </Tr>
            {users.map(user => (
              <Tr>
                <Td>
                  <User name={user.name} desc={user.email} />
                </Td>
                <Td content={user.role} />
                <Td content={user.lastOnline}></Td>
                <Td>
                  <OptionsButton options={options} />
                </Td>
              </Tr>
            ))}
          </Table>
        </div>
      </div>
    </>
  );
}

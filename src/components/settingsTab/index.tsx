import React from 'react';
import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { Topbar } from "../Topbar";
import { User } from "./User";

interface Organization {
  organization_id: number;
  name: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface SettingsTabProps {}

export const SettingsTab: React.FC<SettingsTabProps> = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const options = [
    { label: "Resend Email", link: "" },
    { label: "Change Role", link: "" },
    { label: "Delete User", link: "" },
  ];

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/organization/1`;
        const response = await fetch(baseUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch organization data');
        }
        const data = await response.json();
        setOrganization(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        <Topbar title="Organization Overview" />
        <div className="flex flex-col gap-6">
          <User
            name={organization?.name || 'Loading...'}
            desc="Cool Company Name"
            role="Owner"
            size="md"
          />
          <div className="flex items-center justify-between">
            <div className="text-textPrimary text-base leading-5 font-medium">
              All members
            </div>
            <Link to="adduser">
              <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg">
                + Add Member
              </button>
            </Link>
          </div>
          <Table>
            <Tr>
              <Th content="Name"></Th>
              <Th content="Role"></Th>
              <Th content="Last Online"></Th>
              <Th content=""></Th>
            </Tr>
            {organization && (
              <Tr>
                <Td>
                  <User
                    name={organization.name}
                    desc="Organization Member"
                  />
                </Td>
                <Td content="" />
                <Td content={new Date(organization.updated_at).toLocaleDateString()}></Td>
                <Td>
                  <OptionsButton options={options} />
                </Td>
              </Tr>
            )}
          </Table>
        </div>
      </div>
      <Outlet />
    </>
  );
};

import { SearchBar } from "../shared/searchBar";
import { SectionTitle } from "../shared/sectionTitle";
import { Topbar } from "../Topbar";
import { OrgTable } from "./OrgTable";
import { OrgWidget } from "./OrgWidget";
import { MachinesStatus, NodeDetail, AVS } from "../../interfaces/responses";
import { WidgetItem } from "../shared/machinesWidget/widgetItem";
import useSWR from 'swr';
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";

interface OrgTabProps { }

export const OrgTab: React.FC<OrgTabProps> = () => {
  const { data: avsResponse } = useSWR<AxiosResponse<AVS[]>>(
    'avs',
    () => apiFetch('avs', 'GET')
  );

  const avs = avsResponse?.data;

  const stats = [
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5", nodes: 3,
      totalStake: ["125 ETH", "1,200 Eigen", "54 BTC"],
      avsRunning: ["3", "[AVS 1]", "[AVS 2]", "[AVS 3]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 2]", "[AVS 3]"],
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe6", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe7", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe8", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "1x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe6", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "1x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe7", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "1x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe8", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    // {
    //   address: "3x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe8", nodes: 3,
    //   totalStake: ["225 ETH", "1,500 Eigen"],
    //   avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    //   avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    // },
    // {
    //   address: "3x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe6", nodes: 3,
    //   totalStake: ["225 ETH", "1,500 Eigen"],
    //   avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    //   avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    // },
    // {
    //   address: "3x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe7", nodes: 3,
    //   totalStake: ["225 ETH", "1,500 Eigen"],
    //   avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    //   avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    // },
    // {
    //   address: "3x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe8", nodes: 3,
    //   totalStake: ["225 ETH", "1,500 Eigen"],
    //   avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    //   avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    // },
    {
      address: "2 Total",
      nodes: 6,
      totalStake: ["350 ETH", "2,700 Eigen", "X Other Tokens"],
      avsRunning: ["6"],
      avsActiveSets: ["6"]
    }
  ]

  return (
    <>
      <Topbar title="Overview" />
      <SectionTitle title="Global Stats" className="text-textPrimary" />
      <div className="grid grid-cols-4 gap-4">
        <WidgetItem
          title="Machines"
          description={`${new Set(avs?.map((a: AVS) => a.machine_id)).size ?? 0}`}
          to="/machines"
        />
        <WidgetItem
          title="AVS Nodes"
          description={`${avs?.length ?? 0}`}
          to="/machines"
        />
        <WidgetItem
          title="Active Set"
          description={`${avs?.filter((item: AVS) => item.active_set === true).length ?? 0}`}
          to="/machines"
          connected={true}
        />
        <WidgetItem
          title="Unhealthy"
          description={`${avs?.filter((item: AVS) => item.errors.length > 0).length ?? 0}`}
          to="/machines"
          connected={false}
        />
      </div>
      <SectionTitle title="Per Address" className="text-textPrimary" />
      <div className="grid grid-cols-4 gap-4">
        <div className="ml-auto"></div>
      </div>
      <OrgTable stats={stats.slice(0, -1)} />
    </>
  );
};

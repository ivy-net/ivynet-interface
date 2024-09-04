import { SearchBar } from "../shared/searchBar";
import { SectionTitle } from "../shared/sectionTitle";
import { Topbar } from "../Topbar";
import { OrgTable } from "./OrgTable";
import { OrgWidget } from "./OrgWidget";


interface OrgTabProps {
};

export const OrgTab: React.FC<OrgTabProps> = ({ }) => {
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
      <div className="flex gap-4">
        <SectionTitle title="Stats" className="text-textPrimary" />
        <div className="ml-auto">
        </div>
        <SearchBar />
      </div>
      <OrgWidget data={stats} />
      <OrgTable stats={stats.slice(0, -1)} />
    </>
  );
}

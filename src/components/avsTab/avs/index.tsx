import React from "react";
import { Link, useParams } from "react-router-dom";
import closeIcon from "./../../../images/x-close.svg"
import { AvsWidget } from "../../shared/avsWidget";
import { AvsInfo } from "./AvsInfo";
import { MachineRequirements } from "./MachineRequirements";
import { apiFetch } from "../../../utils";
import { AVS, MachineDetails } from "../../../interfaces/responses";
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { Table } from "../../shared/table";
import { Tr } from "../../shared/table/Tr";
import { Th } from "../../shared/table/Th";
import { Td } from "../../shared/table/Td";
import { MachineWidget } from "../../shared/machineWidget";


interface AvsModalProps {
}

export const AvsModal: React.FC<AvsModalProps> = () => {
  const { avsName } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  const avsResponse = useSWR<AxiosResponse<AVS[]>>('avs', apiFetcher, {
    onSuccess: (data) => console.log("AVS data received:", data?.data),
    onError: (error) => []
  });
  const avsList = avsResponse.data?.data || [];
  const filteredAvsList = avsList.filter(item => item.avs_name === avsName)

  // const machineResponse = useSWR<AxiosResponse<MachineDetails[]>, any>(`machine`, apiFetcher)
  // const machineList = machineResponse.data?.data || []
  // const filteredMachines = machineList.filter(machine => machine.avs_list.findIndex(avs => avs.avs_name === avsName) >= 0)

  // const getMachineName = (id: string) => {
  //   return filteredMachines.find(machine => machine.machine_id === id)?.name.replace(/"/g, '') || ""
  // }

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      {filteredAvsList && filteredAvsList.length &&
        <div className="flex flex-col bg-widgetBg w-[1110px] rounded-xl p-8 gap-10">
          <div className="flex items-start">
            <AvsWidget name={avsName || ""} description="Description" />
            <Link to={".."} relative="path" className="ml-auto">
              <img src={closeIcon} alt="close icon" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4>AVS Info</h4>
            <AvsInfo />
          </div>
          <div className="border-t-[1px] border-white/10"></div>
          <MachineRequirements />
          {/* {filteredAvsList.map(avs => (
            <Table>
              <Tr>
                <Th content="AVS"></Th>
                <Th content="Chain"></Th>
                <Th content="Version"></Th>
                <Th content="Latest"></Th>
                <Th content="Health"></Th>
                <Th content="Score" tooltip="Can show 0 if AVS doesn't have performance score metric."></Th>
                <Th content="Address"></Th>
                <Th content="Active Set" tooltip="Add chain and operator public address to see AVS Active Set status."></Th>
                <Th content="Machine"></Th>
              </Tr>

              {filteredMachines?.map((machine, index) => {

                return (
                  <Tr key={avs.machine_id}>
                    <Td content={avs.avs_name} to={`/machines/avs/${avsName}`} />
                    <Td content={avs.chain || ""} />
                    <Td content={avs.avs_version} />
                    <Td content="" />
                    <Td isConnected={avs.errors.length === 0} />
                    <Td score={avs.performance_score} />
                    <Td content={avs.operator_address || ""} />
                    <Td isChecked={avs.active_set} />
                    <Td>
                      <MachineWidget
                        address={avs.machine_id}
                        name={getMachineName(avs.machine_id)}
                        to={`/machines/${avs.machine_id}`}
                      />
                    </Td>
                  </Tr>
                )
              })}

            </Table>
          ))} */}
          <div className="flex gap-4">
            <Link to="" relative="path" className="ml-auto">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Deploy AVS</div>
            </Link>
            <Link to="" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Upgrade AVS</div>
            </Link>
          </div>
        </div>
      }
    </div >
  );
}

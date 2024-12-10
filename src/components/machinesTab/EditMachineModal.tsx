import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';
import { chains, getMessage } from "../../utils/UiMessages";
import { MachineDetails, NodeDetail, Response } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


interface EditMachineModalProps {
};

export const EditMachineModal: React.FC<EditMachineModalProps> = () => {
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string; } | null>(null);
  const navigate = useNavigate()
  const [address, setAddress] = useState("");

  const { avsName, machineId } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  const response = useSWR<AxiosResponse<MachineDetails>, any>(`machine/${machineId}`, apiFetcher)
  const machine = response.data?.data
  const avs = machine?.avs_list.find(avs => avs.avs_name === avsName)
  // setAddress(avs?.operator_address || "")
  console.log("avs", avs)

  useEffect(() => {
    setAddress(avs?.operator_address || "")
    setSelectedOption({ label: avs?.chain || "", value: avs?.chain || "" })
  }, [avs])

  const editMachine = async (machineId: string, avsName: string, chain: string, address: string) => {
    const url = `machine/${machineId}`
    const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`)
    urlObj.searchParams.set("avs_name", avsName)
    urlObj.searchParams.set("chain", chain)
    urlObj.searchParams.set("operator_address", address)
    const fetchUrl = urlObj.toString()
    try {
      console.log(fetchUrl)
      await apiFetch(fetchUrl, "PUT")
      toast.success(getMessage("MachineEditedMessage"), { theme: "dark" })
      navigate("/machines", { state: { refetch: true } })
    }
    catch (err) {
      // empty
    }
    // console.log(res)
  }

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Edit Machine</h2>
          <Link to="/machines" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Chain</div>
              <Select
                value={selectedOption}
                onChange={(value) => setSelectedOption(value as { value: string; label: string; } | null)}
                options={chains}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    borderColor: state.isFocused ? 'white' : '#6B7280',
                    borderRadius: '0.5rem',
                    padding: '0.25rem 0',
                    '&:hover': {
                      borderColor: 'white',
                    },
                    boxShadow: 'none',
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected ? '#374151' : 'transparent',
                    color: '#667085',
                    '&:hover': {
                      backgroundColor: '#4B5563',
                    },
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: '#667085',
                  }),
                  input: (baseStyles) => ({
                    ...baseStyles,
                    color: '#667085',
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: '#1F2937',
                    borderRadius: '0.5rem',
                  }),
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Address</div>
              <input value={address} onChange={(event) => setAddress(event.currentTarget.value)} className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 ml-auto">
          <Link to="/machines" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Cancel</div>
          </Link>
          <Link to="" relative="path" onClick={() => machine && editMachine(machine.machine_id, avs?.avs_name || "", selectedOption?.value || "", address)}>
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Save Changes</div>
          </Link>
        </div>
      </div>
    </div >
  );
}

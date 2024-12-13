import React from "react";
import { Link, useParams } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import { getMessage } from "../../utils/UiMessages";
import { apiFetch } from "../../utils";
import { toast } from "react-toastify";


interface DeleteMachineModalProps {
};

export const DeleteMachineModal: React.FC<DeleteMachineModalProps> = () => {
  const { avsName, machineId } = useParams();

  const deleteMachine = async (machineId: string, avsName: string) => {
    const url = `machine/${machineId}`
    const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`)
    urlObj.searchParams.set("avs_name", avsName)
    const fetchUrl = urlObj.toString()
    try {
      await apiFetch(fetchUrl, "DELETE")
      toast.success(getMessage("MachineDeletedMessage"), { theme: "dark" })
    }
    catch (err) {
      // empty
    }
  }

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Remove AVS</h2>
          <Link to="/machines" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="">
              <span>Are you sure you want to delete the machine </span>
              <span className="font-bold">{machineId}</span>
              <span> from avs </span>
              <span className="font-bold">{avsName}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 ml-auto">
          <Link to="/machines" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Cancel</div>
          </Link>
          <Link to="/machines" state={{ refetch: true }} relative="path" onClick={() => deleteMachine(machineId || "", avsName || "")}>
            <div className="px-4 py-2 rounded-lg hover:bg-red-600 bg-red-800 text-white">Delete</div>
          </Link>
        </div>
      </div>
    </div >
  );
}

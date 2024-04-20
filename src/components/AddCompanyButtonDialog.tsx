"use client";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import LabelledInput from "./Inputs/LabelledInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import companiesAPI from "../services/companies";
import { useSession } from "next-auth/react";
import { Prisma } from "@prisma/client";

const CompanyInputValidator = z.object({
  name: z.string(),
});

export type CompanyInput = z.infer<typeof CompanyInputValidator>;

const AddCompanyButtonDialog = () => {
  const session = useSession();
  const { register, getValues } = useForm<CompanyInput>({
    resolver: zodResolver(CompanyInputValidator),
  });

  const createCompany = async () => {
    const company: Prisma.CompanyUncheckedCreateInput = {
      name: getValues("name"),
      userId: session.data?.userId ?? "undefined",
    };

    await companiesAPI.post(company);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document.getElementById("add-company")! as any).close()
  };

  return (
    <>
      <button
        className="btn btn-outline ms-auto"
        onClick={() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (document.getElementById("add-company")! as any).showModal()
        }
      >
        <PlusCircleIcon className="w-6 h-6" /> Add Company
      </button>
      <dialog id="add-company" className="modal">
        <div className="modal-box flex flex-col gap-4">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-center">Add Company</h3>
          <LabelledInput
            label="Name"
            placeholder="Enter the name of the comapny..."
            {...register("name")}
          />
          <button className="btn btn-outline" onClick={() => createCompany()}>
            Submit
          </button>
        </div>
      </dialog>
    </>
  );
};

export default AddCompanyButtonDialog;

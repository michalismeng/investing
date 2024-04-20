import { Editor } from "./Editor";
import { useEffect, useState } from "react";
import companiesAPI from "../services/companies";
import { useForm } from "react-hook-form";
import { OutputData } from "@editorjs/editorjs";
import eventsAPI from "../services/events";
import { Company } from "@prisma/client";
import { useParams } from "next/navigation";
import { format } from "date-fns";

const StockEventComponent = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [blocks, setBlocks] = useState<OutputData>();
  const params = useParams();

  const selectedCompany = params.id
    ? +params.id || undefined
    : undefined;

  useEffect(() => {
    companiesAPI
      .get()
      .then(setCompanies)
      .then(() => {
        resetField("companyId", { defaultValue: selectedCompany });
      });
  }, []);

  const { handleSubmit, register, resetField } = useForm<
    FormData & { companyId: number; timelineDate: string }
  >({
    defaultValues: {
      timelineDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (
    values: FormData & {
      companyId: number;
      timelineDate: string;
    }
  ) => {
    const { companyId, timelineDate } = values;
    await eventsAPI.post({
      companyId: +companyId,
      date: new Date(timelineDate),
      entry: blocks as object,
    });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Write your event</h1>

      <div className="flex flex-row gap-4 items-start justify-between">
        <Editor setBlocks={setBlocks} />

        <form onSubmit={handleSubmit(onSubmit)} className="w-fit">
          <div className="flex flex-col gap-4 justify-center items-end">
            <label className="form-control w-full">
              <div className="label pt-0">
                <span className="label-text">Pick the date:</span>
              </div>
              <input
                type="date"
                className="select select-bordered w-full max-w-xs focus:outline-none"
                {...register("timelineDate")}
              />
            </label>

            <label className="form-control w-full">
              <div className="label pt-0">
                <span className="label-text">Pick your company:</span>
              </div>
              <select
                className="select select-bordered w-full max-w-xs focus:outline-none"
                {...register("companyId")}
              >
                <option value={0}>Select your company...</option>
                {companies &&
                  companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>

            <button type="submit" className="btn btn-outline w-full">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEventComponent;

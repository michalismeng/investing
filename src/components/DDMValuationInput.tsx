import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LabelledInput from "./Inputs/LabelledInput";

const DDMValuationInputsValidator = z.object({
  eps: z.coerce.number(),
  epsGrowth: z.coerce.number(),
  payout: z.coerce.number(),
  gradualAdj: z.coerce.boolean(),
  returnRate: z.coerce.number(),
  stableReturnRate: z.coerce.number(),
  stablePayout: z.coerce.number(),
  stableGrowth: z.coerce.number(),
});

export type DDMValuationInput = z.infer<typeof DDMValuationInputsValidator>;
interface ValuationInputProps extends React.HTMLAttributes<HTMLFormElement> {
  setValuationInput?: Dispatch<SetStateAction<DDMValuationInput | undefined>>;
}

export const DDMValuationInputForm: FC<ValuationInputProps> = ({
  setValuationInput,
}) => {
  const { register, getValues } = useForm<DDMValuationInput>({
    resolver: zodResolver(DDMValuationInputsValidator),
    defaultValues: {
      eps: 2.29,
      epsGrowth: 0.0859,
      payout: 0.4716,
      gradualAdj: true,
      returnRate: 0.051,
      stableReturnRate: 0.09,
      stableGrowth: 0.005,
      stablePayout: 0.6667,
    },
  });

  useEffect(() => {
    setValuationInput?.(getValues());
  }, []);

  return (
    <div>
      <form onChange={() => setValuationInput?.(getValues())}>
        <div className="grid grid-cols-2 w-fit gap-4">
          <div className="flex flex-col gap-4 w-fit">
            <LabelledInput
              label="EPS"
              placeholder="Enter the company's EPS..."
              {...register("eps", { valueAsNumber: true })}
            />
            <LabelledInput
              label="EPS Growth"
              placeholder="Enter the company's EPS growth rate ..."
              {...register("epsGrowth", { valueAsNumber: true })}
            />
            <LabelledInput
              label="Payout"
              placeholder="Enter the company's payout ratio ..."
              {...register("payout", { valueAsNumber: true })}
            />
            <LabelledInput
              label="Return Rate"
              placeholder="Enter the desired return rate ..."
              {...register("returnRate", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-4 w-fit">
            <LabelledInput
              type="checkbox"
              divider={false}
              className="checkbox"
              label="Gradually adjust values to stable phase"
              {...register("gradualAdj")}
            />
            <LabelledInput
              label="Stable Growth"
              placeholder="Enter the company's growth rate in the stable..."
              {...register("stableGrowth", { valueAsNumber: true })}
            />
            <LabelledInput
              label="Stable Payout"
              placeholder="Enter the company's payout ratio in the stable phase ..."
              {...register("stablePayout", { valueAsNumber: true })}
            />
            <LabelledInput
              label="Stable Return Rate"
              placeholder="Enter the desired return rate in the stable phase ..."
              {...register("stableReturnRate", { valueAsNumber: true })}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

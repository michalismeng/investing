import { Button, Checkbox } from "@material-tailwind/react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { Input } from "@material-tailwind/react";

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
  performValuation: (f: DDMValuationInput) => void;
}

export const DDMValuationInputForm: FC<ValuationInputProps> = ({
  performValuation,
  ...props
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<DDMValuationInput>({
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

  return (
    <form
      className="flex flex-row justify-start items-start gap-4 w-fit m-2"
      onSubmit={handleSubmit((e) => performValuation(e))}
    >
      <div className="flex flex-col gap-4">
        <Input
          variant="outlined"
          label="EPS"
          color="white"
          {...register("eps")}
        />
        <Input
          variant="outlined"
          label="EPS growth"
          color="white"
          {...register("epsGrowth")}
        />
        <Input
          variant="outlined"
          label="Payout"
          color="white"
          {...register("payout")}
        />
        <Input
          variant="outlined"
          label="Return Rate"
          color="white"
          {...register("returnRate")}
        />
        <Checkbox label="Gradual Adjustment" {...register("gradualAdj")} />
      </div>
      <div className="flex flex-col gap-4">
        <Input
          variant="outlined"
          label="Stable Growth"
          color="white"
          {...register("stableGrowth")}
        />
        <Input
          variant="outlined"
          label="Stable Payout"
          color="white"
          {...register("stablePayout")}
        />
        <Input
          variant="outlined"
          label="Stable Return Rate"
          color="white"
          {...register("stableReturnRate")}
        />
        <Button
          type="submit"
          className="w-full border p-2 rounded-md ml-auto hover:bg-gray-800"
        >
          Valuate!
        </Button>
      </div>
    </form>
  );
};

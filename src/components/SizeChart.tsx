import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sizeDataCM = [
  { size: "S/M", length: 60, width: 64 },
  { size: "L/XL", length: 64, width: 69 },
];

const sizeDataInch = [
  { size: "S/M", length: 23.6, width: 25.2 },
  { size: "L/XL", length: 25.2, width: 27.2 },
];

const SizeChart = () => {
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const sizeData = unit === "cm" ? sizeDataCM : sizeDataInch;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-accent underline font-body text-sm hover:text-pink transition-colors">
          Size Chart
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Size Chart</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="unit"
                checked={unit === "cm"}
                onChange={() => setUnit("cm")}
                className="accent-accent"
              />
              <span className="font-body text-sm">CM</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="unit"
                checked={unit === "inch"}
                onChange={() => setUnit("inch")}
                className="accent-accent"
              />
              <span className="font-body text-sm">INCH</span>
            </label>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-4 text-left font-body text-sm font-medium">Size</th>
                <th className="py-2 px-4 text-center font-body text-sm font-medium">Length</th>
                <th className="py-2 px-4 text-center font-body text-sm font-medium">Width</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map((row) => (
                <tr key={row.size} className="border-b border-border">
                  <td className="py-2 px-4 font-body text-sm font-medium">{row.size}</td>
                  <td className="py-2 px-4 text-center font-body text-sm text-accent">{row.length}</td>
                  <td className="py-2 px-4 text-center font-body text-sm text-accent">{row.width}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChart;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sizeDataCM = [
  { size: "S", length: 68, chest: 56, shoulder: 50 },
  { size: "M", length: 70, chest: 58, shoulder: 52 },
];

const sizeDataInch = [
  { size: "S", length: 26.8, chest: 22, shoulder: 19.7 },
  { size: "M", length: 27.6, chest: 22.8, shoulder: 20.5 },
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
                <th className="py-2 px-4 text-center font-body text-sm font-medium">Chest</th>
                <th className="py-2 px-4 text-center font-body text-sm font-medium">Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map((row) => (
                <tr key={row.size} className="border-b border-border">
                  <td className="py-2 px-4 font-body text-sm font-medium">{row.size}</td>
                  <td className="py-2 px-4 text-center font-body text-sm text-accent">{row.length}</td>
                  <td className="py-2 px-4 text-center font-body text-sm text-accent">{row.chest}</td>
                  <td className="py-2 px-4 text-center font-body text-sm text-accent">{row.shoulder}</td>
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
